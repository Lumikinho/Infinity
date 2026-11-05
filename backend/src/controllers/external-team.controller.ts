import type { Request, Response } from 'express'

import gameModel from '../repository/game.repository'
import { searchExternalTeams, wikiForGame } from '../services/external-team.service'

function texto(value: unknown) {
  if (typeof value !== 'string') return null

  const trimmed = value.trim()

  return trimmed.length > 0 ? trimmed : null
}

const externalTeamController = {
  buscar: async (req: Request, res: Response) => {
    try {
      const query = texto(req.query.q)
      const gameId = texto(req.query.gameId)

      if (!query || query.length < 2) {
        return res.status(400).json({
          message: 'Digite ao menos 2 caracteres para buscar',
        })
      }

      if (!gameId) {
        return res.status(400).json({
          message: 'Informe o jogo da partida',
        })
      }

      const game = await gameModel.buscarPorId(gameId)

      if (!game) {
        return res.status(400).json({
          message: 'Jogo não encontrado',
        })
      }

      const wiki = wikiForGame(game.name)

      if (!wiki) {
        return res.status(200).json({
          teams: [],
          supported: false,
        })
      }

      const teams = await searchExternalTeams(wiki, query)

      return res.status(200).json({
        teams,
        supported: true,
      })
    } catch (error) {
      console.error('Erro ao buscar times externos:', error)

      return res.status(502).json({
        message: 'Não foi possível consultar a API de times agora. Tente novamente.',
      })
    }
  },
}

export default externalTeamController
