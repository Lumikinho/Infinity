import { Router } from 'express'
import userRoutes from './user.routes'
import uploadMiddleware from '../middlewares/upload.middleware'

const router = Router()

router.use('/user', uploadMiddleware, userRoutes)

export default router
