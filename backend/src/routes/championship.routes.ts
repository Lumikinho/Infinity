import { Router } from 'express'
import championshipController from '../controllers/championship.controller'

const championshipRoutes = Router()

championshipRoutes.get('/', championshipController.listar)
championshipRoutes.get('/player/:userId', championshipController.listarPorJogador)
championshipRoutes.post('/', championshipController.cadastrar)
championshipRoutes.put('/:id', championshipController.alterar)
championshipRoutes.delete('/:id', championshipController.remover)

export default championshipRoutes
