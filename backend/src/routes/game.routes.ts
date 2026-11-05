import { Router } from 'express'
import gameController from '../controllers/game.controller'

const gameRoutes = Router()

gameRoutes.get('/', gameController.listar)
gameRoutes.post('/', gameController.cadastrar)
gameRoutes.put('/:id', gameController.alterar)
gameRoutes.delete('/:id', gameController.remover)

export default gameRoutes
