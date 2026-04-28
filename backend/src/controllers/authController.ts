import { Request, Response, NextFunction } from 'express'
import { googleVerifier } from '../services/googleVerifier'
import { userService } from '../services/userService'
import { tokenService } from '../services/tokenService'
import { HttpError } from '../middleware/httpError'

export const authController = {
  async google(req: Request, res: Response, next: NextFunction) {
    try {
      const { id_token } = req.body
      if (!id_token || typeof id_token !== 'string') {
        throw new HttpError(422, 'id_token is required')
      }

      let payload
      try {
        payload = await googleVerifier.verify(id_token)
      } catch {
        throw new HttpError(401, 'Invalid Google token')
      }

      const user = await userService.findOrCreate({
        name: payload.name,
        email: payload.email,
        sub: payload.sub,
      })

      if (!user.is_active) {
        throw new HttpError(403, 'Account disabled')
      }

      const token = tokenService.sign({ userId: user.id, role: user.role })

      res.json({
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          token,
        },
      })
    } catch (e) {
      next(e)
    }
  },

  me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new HttpError(401, 'Unauthorized')
      const { id, name, email, role } = req.user
      res.json({ data: { id, name, email, role } })
    } catch (e) {
      next(e)
    }
  },
}
