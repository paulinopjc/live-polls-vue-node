import express, { Request, Response } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import pollsRouter from './routes/polls'
import { errorHandler } from './middleware/errorHandler'
import { notFound } from './middleware/notFound'

export function createApp() {
  const app = express()

  app.use(cors({ origin: process.env.FRONTEND_URL || '*' }))
  app.use(morgan('dev'))
  app.use(express.json())

  app.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'Live Polls API is running' })
  })

  app.use('/api/polls', pollsRouter)

  app.use(notFound)
  app.use(errorHandler)

  return app
}