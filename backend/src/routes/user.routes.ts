import { Router } from 'express'
import userController from '../controllers/user.controller'
const userRoutes = Router()

userRoutes.get('/', userController.listar)
userRoutes.post('/', userController.cadastrar)
userRoutes.put('/:UUID', userController.alterar)
userRoutes.delete('/:UUID', userController.remover)

export default userRoutes
