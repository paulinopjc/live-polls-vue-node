import { Server as HttpServer } from 'http'
import { Server as IOServer, Socket } from 'socket.io'
import { pollService } from './services/pollService'
import { joinSchema, voteSchema } from './validators/pollValidator'
import { voteRateLimiter } from './services/voteRateLimiter'

export function createSocketServer(httpServer: HttpServer): IOServer {
  const io = new IOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`)

    socket.on('join', async (payload: unknown) => {
      const parsed = joinSchema.safeParse(payload)
      if (!parsed.success) {
        socket.emit('vote-error', { message: 'Invalid join payload' })
        return
      }
      const { pollId } = parsed.data
      const result = await pollService.findWithTotals(pollId)
      if (!result) {
        socket.emit('vote-error', { message: 'Poll not found' })
        return
      }
      socket.join(pollId)
      socket.emit('poll-state', result)
      broadcastConnectionCount(io, pollId)
    })

    socket.on('leave', (payload: unknown) => {
      const parsed = joinSchema.safeParse(payload)
      if (!parsed.success) return
      const { pollId } = parsed.data
      socket.leave(pollId)
      broadcastConnectionCount(io, pollId)
    })

    socket.on('vote', async (payload: unknown) => {
      const parsed = voteSchema.safeParse(payload)
      if (!parsed.success) {
        socket.emit('vote-error', { message: 'Invalid vote payload' })
        return
      }
      const { pollId, optionId, sessionId } = parsed.data

      if (!voteRateLimiter.allow(sessionId)) {
        socket.emit('vote-error', { message: 'Slow down, wait a moment' })
        return
      }

      const result = await pollService.recordVote({ pollId, optionId, sessionId })
      if (!result.ok) {
        socket.emit('vote-error', { message: result.reason })
        return
      }

      io.to(pollId).emit('vote-update', {
        optionId,
        totals: result.totals,
        total_votes: result.total_votes,
      })
    })

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`)
      // Recompute connection count for every room this socket was in
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          broadcastConnectionCount(io, room)
        }
      })
    })
  })

  return io
}

function broadcastConnectionCount(io: IOServer, pollId: string) {
  const room = io.sockets.adapter.rooms.get(pollId)
  const count = room ? room.size : 0
  io.to(pollId).emit('connection-count', { count })
}