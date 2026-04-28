import { Request, Response, NextFunction } from 'express'
import { pollService } from '../services/pollService'
import { createPollSchema } from '../validators/pollValidator'
import { HttpError } from '../middleware/httpError'

function flattenZodError(error: import('zod').ZodError): Record<string, string> {
  const details: Record<string, string> = {}
  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_'
    details[path] = issue.message
  }
  return details
}

export const pollController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createPollSchema.safeParse(req.body)
      if (!parsed.success) {
        throw new HttpError(422, 'Validation failed', flattenZodError(parsed.error))
      }
      const poll = await pollService.create(parsed.data)
      res.status(201).json({ data: poll })
    } catch (e) {
      next(e)
    }
  },

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id)
      const result = await pollService.findWithTotals(id)
      if (!result) {
        throw new HttpError(404, 'Poll not found')
      }
      res.json({ data: result })
    } catch (e) {
      next(e)
    }
  },
}