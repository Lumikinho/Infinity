import { Router } from 'express'
import matchController from '../controllers/match.controller'

const matchRoutes = Router()

matchRoutes.get('/', matchController.listar)
matchRoutes.post('/', matchController.cadastrar)
matchRoutes.put('/:id', matchController.alterar)
matchRoutes.delete('/:id', matchController.remover)

export default matchRoutes
