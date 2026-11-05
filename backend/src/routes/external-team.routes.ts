import { Router } from 'express'
import externalTeamController from '../controllers/external-team.controller'

const externalTeamRoutes = Router()

externalTeamRoutes.get('/', externalTeamController.buscar)

export default externalTeamRoutes
