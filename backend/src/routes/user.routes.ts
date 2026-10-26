import { Router } from 'express'
import userController from '../controller/user.controller'
const userRoutes = Router()

userRoutes.get('/', userController.listar)

export default userRoutes
