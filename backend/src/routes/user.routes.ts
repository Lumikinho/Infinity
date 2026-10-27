import { Router } from 'express'
import userController from '../controllers/user.controller'
const userRoutes = Router()

userRoutes.get('/', userController.listar)
userRoutes.post('/', userController.cadastrar)

export default userRoutes
