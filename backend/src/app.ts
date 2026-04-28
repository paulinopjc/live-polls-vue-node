import express, { Request, Response } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import pollsRouter from './routes/polls'
import authRouter from './routes/auth'
import adminRouter from './routes/admin'
import { errorHandler } from './middleware/errorHandler'
import { notFound } from './middleware/notFound'

export function createApp() {
  const app = express()

  // Security headers
  app.use(helmet())

  app.use(cors({ origin: process.env.FRONTEND_URL || '*' }))
  app.use(morgan('dev'))
  app.use(express.json())

  // Rate limiting
  const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
  })

  const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
  })

  app.use('/api/', generalLimiter)
  app.use('/api/auth/', authLimiter)

  app.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'Live Polls API is running' })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/polls', pollsRouter)
  app.use('/api/admin', adminRouter)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
