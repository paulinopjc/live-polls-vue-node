import { Request, Response, NextFunction } from 'express'
import { pollService } from '../services/pollService'
import { HttpError } from '../middleware/httpError'

export const adminController = {
  async listPolls(_req: Request, res: Response, next: NextFunction) {
    try {
      const polls = await pollService.listAll()
      res.json({ data: polls, count: polls.length })
    } catch (e) {
      next(e)
    }
  },

  async approvePoll(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id)
      const updated = await pollService.setStatus(id, 'approved')
      if (!updated) throw new HttpError(404, 'Poll not found')
      res.json({ data: updated })
    } catch (e) {
      next(e)
    }
  },

  async denyPoll(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id)
      const updated = await pollService.setStatus(id, 'denied')
      if (!updated) throw new HttpError(404, 'Poll not found')
      res.json({ data: updated })
    } catch (e) {
      next(e)
    }
  },

  async editPoll(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id)
      const { question } = req.body
      if (!question || typeof question !== 'string' || question.trim().length === 0) {
        throw new HttpError(422, 'Question is required')
      }
      const updated = await pollService.updateQuestion(id, question.trim())
      if (!updated) throw new HttpError(404, 'Poll not found')
      res.json({ data: updated })
    } catch (e) {
      next(e)
    }
  },

  async deletePoll(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id)
      const deleted = await pollService.deletePoll(id)
      if (!deleted) throw new HttpError(404, 'Poll not found')
      res.status(204).send()
    } catch (e) {
      next(e)
    }
  },
}
