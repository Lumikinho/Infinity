import { Router } from 'express'
import teamController from '../controllers/team.controller'

const teamRoutes = Router()

teamRoutes.get('/', teamController.listar)
teamRoutes.get('/:id', teamController.buscar)
teamRoutes.post('/', teamController.cadastrar)
teamRoutes.put('/:id', teamController.alterar)
teamRoutes.delete('/:id', teamController.remover)

export default teamRoutes
