# Live Polls

Real-time polling app where users create polls, share a link, and watch votes update live across all connected browsers. Built with Vue 3 + Node.js + Socket.IO + PostgreSQL.

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js, Express 5, TypeScript, Socket.IO 4 |
| **Frontend** | Vue 3 (Composition API), TypeScript, Pinia, Tailwind CSS |
| **Database** | PostgreSQL 16 (via Docker) |
| **Real-time** | Socket.IO (server + client) |
| **Validation** | Zod |
| **Testing** | Jest + Supertest (backend), Vitest (frontend) |
| **Build** | TypeScript compiler (backend), Vite 8 (frontend) |

## Features

- Create polls with 2-6 options
- Share poll URL for others to vote
- Votes update in real time across all connected browsers (Socket.IO rooms)
- "X people connected" live indicator per poll
- Session-based duplicate vote prevention (one vote per browser per poll)
- Vote rate limiting (250ms minimum between votes per session)
- Persistent data (PostgreSQL, survives restarts)
- Input validation on REST and socket events (Zod)
- Full test suite (REST endpoints + Socket.IO integration tests)

## Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)
- npm

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/paulinopjc/live-polls-vue-node.git
cd live-polls-vue-node
```

Install dependencies for both backend and frontend:

```bash
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

This starts PostgreSQL 16 on port 5433.

### 3. Set up environment variables

Backend:

```bash
cp backend/.env.example backend/.env
```

`backend/.env`:

```
PORT=4002
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/live_polls
NODE_ENV=development
```

Frontend:

```bash
cp frontend/.env.example frontend/.env
```

`frontend/.env`:

```
VITE_API_URL=http://localhost:4002/api
VITE_SOCKET_URL=http://localhost:4002
```

### 4. Run database migrations

```bash
cd backend
npm run migrate
```

### 5. Start both dev servers

Terminal 1 (backend):

```bash
cd backend
npm run dev
```

Terminal 2 (frontend):

```bash
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/api/polls` | Create a poll |
| `GET` | `/api/polls/:id` | Get a poll with vote totals |

### POST /api/polls

```json
{
  "question": "Where should we eat?",
  "options": ["Pizza", "Sushi", "Tacos"]
}
```

Response (201):

```json
{
  "data": {
    "id": "Wq7-aB3-x9Y",
    "question": "Where should we eat?",
    "options": [
      { "id": 1, "label": "Pizza", "position": 0 },
      { "id": 2, "label": "Sushi", "position": 1 },
      { "id": 3, "label": "Tacos", "position": 2 }
    ],
    "created_at": "2026-04-28T10:30:00.000Z"
  }
}
```

### GET /api/polls/:id

Response (200):

```json
{
  "data": {
    "poll": { "id": "Wq7-aB3-x9Y", "question": "...", "options": [...] },
    "totals": { "1": 5, "2": 3, "3": 2 },
    "total_votes": 10
  }
}
```

## Socket.IO Events

### Client to Server

| Event | Payload | Description |
|---|---|---|
| `join` | `{ pollId }` | Join a poll room. Server replies with `poll-state`. |
| `leave` | `{ pollId }` | Leave a poll room. |
| `vote` | `{ pollId, optionId, sessionId }` | Cast a vote. |

### Server to Client

| Event | Payload | Description |
|---|---|---|
| `poll-state` | `{ poll, totals, total_votes }` | Sent on join with current state. |
| `vote-update` | `{ optionId, totals, total_votes }` | Broadcast to room on successful vote. |
| `connection-count` | `{ count }` | Broadcast when room size changes. |
| `vote-error` | `{ message }` | Sent to originating socket on failure. |

## Testing

### Backend

Create the test database (first time only):

```bash
docker exec -it live-polls-vue-node-db-1 psql -U postgres -c "CREATE DATABASE live_polls_test;"
```

Run tests:

```bash
cd backend
npm test
```

Tests run sequentially (`--runInBand`) because the REST and Socket.IO suites share the same test database.

### Frontend

```bash
cd frontend
npm test
```

## Production Build

### Backend

```bash
cd backend
npm run build
NODE_ENV=production node dist/server.js
```

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

## Project Structure

```
live-polls-vue-node/
├── backend/
│   ├── src/
│   │   ├── server.ts              # Entry point (HTTP + Socket.IO)
│   │   ├── app.ts                 # Express app setup
│   │   ├── socket.ts              # Socket.IO event handlers
│   │   ├── db/
│   │   │   ├── connection.ts      # PostgreSQL connection pool
│   │   │   └── migrate.ts         # Schema setup
│   │   ├── routes/
│   │   │   └── polls.ts           # REST routes
│   │   ├── controllers/
│   │   │   └── pollController.ts  # Request handlers
│   │   ├── services/
│   │   │   ├── pollService.ts     # Business logic + DB access
│   │   │   └── voteRateLimiter.ts # Per-session throttling
│   │   ├── validators/
│   │   │   └── pollValidator.ts   # Zod schemas
│   │   ├── middleware/
│   │   │   ├── httpError.ts       # Custom error class
│   │   │   ├── errorHandler.ts    # Error response middleware
│   │   │   └── notFound.ts        # 404 handler
│   │   ├── lib/
│   │   │   └── ids.ts             # Random poll ID generator
│   │   └── types/
│   │       └── poll.ts            # TypeScript interfaces
│   ├── tests/
│   │   ├── polls.test.ts          # REST API tests
│   │   ├── socket.test.ts         # Socket.IO integration tests
│   │   ├── setup.ts               # Test DB setup/teardown
│   │   └── env.ts                 # Test environment variables
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.ts
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts          # Axios instance
│   │   │   ├── pollApi.ts         # REST API functions
│   │   │   └── socket.ts          # Socket.IO client singleton
│   │   ├── stores/
│   │   │   ├── poll.ts            # Pinia store (poll state)
│   │   │   └── session.ts         # Browser session ID
│   │   ├── composables/
│   │   │   └── useSocket.ts       # Socket event subscription with cleanup
│   │   ├── views/
│   │   │   ├── HomeView.vue       # Landing page
│   │   │   ├── PollCreateView.vue # Create poll form
│   │   │   └── PollView.vue       # Live poll (vote + results)
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── polls/
│   │   │   └── shared/
│   │   ├── router/
│   │   │   └── index.ts
│   │   └── types/
│   │       └── poll.ts
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── docker-compose.yml
```

## License

MIT
