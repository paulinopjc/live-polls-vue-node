import 'dotenv/config'
import http from 'http'
import { createApp } from './app'
import { createSocketServer } from './socket'

const port = Number(process.env.PORT) || 4002

const app = createApp()
const httpServer = http.createServer(app)
const io = createSocketServer(httpServer)

httpServer.listen(port, () => {
  console.log(`Live Polls server listening on http://localhost:${port}`)
})

// Optional: graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...')
  io.close()
  httpServer.close(() => {
    process.exit(0)
  })
})