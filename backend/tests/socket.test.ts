import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals'
import http from 'http'
import { AddressInfo } from 'net'
import { io as Client, Socket as ClientSocket } from 'socket.io-client'
import { createApp } from '../src/app'
import { createSocketServer } from '../src/socket'
import { pollService } from '../src/services/pollService'

let httpServer: http.Server
let io: ReturnType<typeof createSocketServer>
let port: number

beforeAll((done) => {
  const app = createApp()
  httpServer = http.createServer(app)
  io = createSocketServer(httpServer)
  httpServer.listen(0, () => {
    port = (httpServer.address() as AddressInfo).port
    done()
  })
})

afterAll((done) => {
  io.close()
  httpServer.close(() => done())
})

function connect(): Promise<ClientSocket> {
  return new Promise((resolve) => {
    const client = Client(`http://localhost:${port}`, {
      transports: ['websocket'],
      forceNew: true,
    })
    client.on('connect', () => resolve(client))
  })
}

describe('Socket join', () => {
  it('joins a poll room and receives poll-state', async () => {
    const poll = await pollService.create({ question: 'Q?', options: ['A', 'B'] })

    const client = await connect()

    const state: Promise<unknown> = new Promise((resolve) => {
      client.on('poll-state', (payload) => resolve(payload))
    })

    client.emit('join', { pollId: poll.id })

    const result = (await state) as { poll: { id: string }; total_votes: number }
    expect(result.poll.id).toBe(poll.id)
    expect(result.total_votes).toBe(0)

    client.disconnect()
  })

  it('returns vote-error for non-existent poll', async () => {
    const client = await connect()

    const error: Promise<unknown> = new Promise((resolve) => {
      client.on('vote-error', (payload) => resolve(payload))
    })

    client.emit('join', { pollId: 'nope' })
    const result = (await error) as { message: string }
    expect(result.message).toBe('Poll not found')

    client.disconnect()
  })
})

describe('Socket vote', () => {
  it('records a vote and broadcasts vote-update to the room', async () => {
    const poll = await pollService.create({ question: 'Q?', options: ['A', 'B'] })

    const voter = await connect()
    const watcher = await connect()

    await new Promise<void>((resolve) => {
      let joined = 0
      const onState = () => {
        joined++
        if (joined === 2) resolve()
      }
      voter.once('poll-state', onState)
      watcher.once('poll-state', onState)
      voter.emit('join', { pollId: poll.id })
      watcher.emit('join', { pollId: poll.id })
    })

    const update: Promise<unknown> = new Promise((resolve) => {
      watcher.on('vote-update', (payload) => resolve(payload))
    })

    voter.emit('vote', {
      pollId: poll.id,
      optionId: poll.options[0].id,
      sessionId: 'session-abc-123',
    })

    const result = (await update) as { totals: Record<number, number>; total_votes: number }
    expect(result.total_votes).toBe(1)
    expect(result.totals[poll.options[0].id]).toBe(1)

    voter.disconnect()
    watcher.disconnect()
  })

  it('rejects a duplicate vote with vote-error', async () => {
    const poll = await pollService.create({ question: 'Q?', options: ['A', 'B'] })
    const client = await connect()

    await new Promise<void>((resolve) => {
      client.once('poll-state', () => resolve())
      client.emit('join', { pollId: poll.id })
    })

    client.emit('vote', {
      pollId: poll.id,
      optionId: poll.options[0].id,
      sessionId: 'session-dupe',
    })

    await new Promise((r) => setTimeout(r, 100))

    const error: Promise<unknown> = new Promise((resolve) => {
      client.once('vote-error', (payload) => resolve(payload))
    })

    setTimeout(() => {
      client.emit('vote', {
        pollId: poll.id,
        optionId: poll.options[0].id,
        sessionId: 'session-dupe',
      })
    }, 300)

    const result = (await error) as { message: string }
    expect(result.message).toMatch(/already voted/i)

    client.disconnect()
  })
})