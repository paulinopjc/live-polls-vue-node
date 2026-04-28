import { Router } from 'express'
import { adminController } from '../controllers/adminController'
import { authRequired, adminRequired } from '../middleware/authMiddleware'

const router = Router()

router.use(authRequired)
router.use(adminRequired)

router.get('/polls', adminController.listPolls)
router.patch('/polls/:id/approve', adminController.approvePoll)
router.patch('/polls/:id/deny', adminController.denyPoll)
router.patch('/polls/:id', adminController.editPoll)
router.delete('/polls/:id', adminController.deletePoll)

export default router
