import { Router } from 'express'
import { pollController } from '../controllers/pollController'

const router = Router()

router.post('/', pollController.create)
router.get('/:id', pollController.show)

export default router