import { Router } from 'express'
import userController from '../controller/userController'
const userRoutes = Router()

userRoutes.get('/', userController.listar)

export default userRoutes
