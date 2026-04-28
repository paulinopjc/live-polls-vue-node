import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { googleVerifier } from '../services/googleVerifier'
import { userService } from '../services/userService'
import { tokenService } from '../services/tokenService'
import { HttpError } from '../middleware/httpError'

function getFrontendUrl(): string {
  return (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '')
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET must be set')
  return secret
}

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

  redirect(req: Request, res: Response, next: NextFunction) {
    try {
      const redirectPath = (req.query.redirect as string) || '/'
      const state = jwt.sign({ redirect: redirectPath }, getJwtSecret(), { expiresIn: '10m' })
      const authUrl = googleVerifier.getAuthUrl(state)
      res.redirect(authUrl)
    } catch (e) {
      next(e)
    }
  },

  async callback(req: Request, res: Response, next: NextFunction) {
    const frontendUrl = getFrontendUrl()

    try {
      const { code, state } = req.query
      if (!code || !state) {
        res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('Missing authorization code')}`)
        return
      }

      let redirectPath = '/'
      try {
        const decoded = jwt.verify(state as string, getJwtSecret()) as { redirect?: string }
        redirectPath = decoded.redirect || '/'
      } catch {
        res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('Invalid or expired state')}`)
        return
      }

      let payload
      try {
        payload = await googleVerifier.exchangeCode(code as string)
      } catch {
        res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('Google authentication failed')}`)
        return
      }

      const user = await userService.findOrCreate({
        name: payload.name,
        email: payload.email,
        sub: payload.sub,
      })

      if (!user.is_active) {
        res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('Account disabled')}`)
        return
      }

      const token = tokenService.sign({ userId: user.id, role: user.role })
      const userObj = { id: user.id, name: user.name, email: user.email, role: user.role }

      const hash = `token=${token}&user=${encodeURIComponent(JSON.stringify(userObj))}&redirect=${encodeURIComponent(redirectPath)}`
      res.redirect(`${frontendUrl}/auth/callback#${hash}`)
    } catch (e) {
      res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('Authentication failed')}`)
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
