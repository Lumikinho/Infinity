import { Router } from 'express'
import userRoutes from './user.routes'
import authRoutes from './auth.routes'
import championshipRoutes from './championship.routes'
import externalTeamRoutes from './external-team.routes'
import gameRoutes from './game.routes'
import matchRoutes from './match.routes'
import playerRoutes from './player.routes'
import teamRoutes from './team.routes'
import uploadMiddleware, { uploadPlayerPhoto, uploadTeamLogo } from '../middlewares/upload.middleware'

const router = Router()

router.use('/auth', authRoutes)
router.use('/user', uploadMiddleware, userRoutes)
router.use('/championship', championshipRoutes)
router.use('/external-team', externalTeamRoutes)
router.use('/game', gameRoutes)
router.use('/match', matchRoutes)
router.use('/player', uploadPlayerPhoto, playerRoutes)
router.use('/team', uploadTeamLogo, teamRoutes)

export default router
