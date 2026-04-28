import { Router } from 'express'
import { pollController } from '../controllers/pollController'
import { authRequired } from '../middleware/authMiddleware'

const router = Router()

router.get('/', pollController.list)
router.post('/', authRequired, pollController.create)
router.get('/:id', pollController.show)

export default router
