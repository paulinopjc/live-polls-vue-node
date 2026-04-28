import { Request, Response, NextFunction } from 'express'
import { tokenService } from '../services/tokenService'
import { userService } from '../services/userService'
import { HttpError } from './httpError'

export function authRequired(req: Request, _res: Response, next: NextFunction) {
  (async () => {
    const header = req.header('Authorization')
    if (!header || !header.startsWith('Bearer ')) {
      throw new HttpError(401, 'Missing or invalid Authorization header')
    }

    const token = header.slice('Bearer '.length).trim()
    if (!token) throw new HttpError(401, 'Empty token')

    let payload
    try {
      payload = tokenService.verify(token)
    } catch {
      throw new HttpError(401, 'Invalid or expired token')
    }

    const user = await userService.find(payload.userId)
    if (!user) throw new HttpError(401, 'User not found')
    if (!user.is_active) throw new HttpError(401, 'Account disabled')

    req.user = user
    next()
  })().catch(next)
}

export function adminRequired(req: Request, _res: Response, next: NextFunction) {
  (async () => {
    if (!req.user) throw new HttpError(401, 'Unauthorized')
    if (req.user.role !== 'admin') throw new HttpError(403, 'Admin role required')
    next()
  })().catch(next)
}
