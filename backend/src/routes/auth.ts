import { Router } from 'express'
import { authController } from '../controllers/authController'
import { authRequired } from '../middleware/authMiddleware'

const router = Router()

router.get('/google', authController.redirect)
router.get('/google/callback', authController.callback)
router.post('/google', authController.google)
router.get('/me', authRequired, authController.me)

export default router
