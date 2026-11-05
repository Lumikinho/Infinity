import { Router } from 'express'
import playerController from '../controllers/player.controller'

const playerRoutes = Router()

playerRoutes.get('/', playerController.listar)
playerRoutes.get('/user/:userId', playerController.buscarPorUsuario)
playerRoutes.get('/:id', playerController.buscar)
playerRoutes.post('/', playerController.cadastrar)
playerRoutes.put('/:id', playerController.alterar)
playerRoutes.delete('/:id', playerController.remover)

export default playerRoutes
