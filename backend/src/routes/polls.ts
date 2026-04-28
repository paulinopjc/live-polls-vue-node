import { Router } from 'express'
import { pollController } from '../controllers/pollController'

const router = Router()

router.get('/', pollController.list)
router.post('/', pollController.create)
router.get('/:id', pollController.show)

export default router