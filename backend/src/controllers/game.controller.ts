import type { Request, Response } from 'express'

import { Prisma } from '../generated/prisma/client'
import gameModel from '../repository/game.repository'

const gameController = {
  listar: async (_req: Request, res: Response) => {
    try {
      const database = await gameModel.listar()

      return res.status(200).json({
        database,
      })
    } catch (error) {
      console.error('Erro ao listar jogos:', error)

      return res.status(500).json({
        message: 'Erro ao buscar jogos',
      })
    }
  },
  cadastrar: async (req: Request, res: Response) => {
    try {
      const { name }: { name?: string } = req.body ?? {}

      if (!name || name.trim().length < 2) {
        return res.status(400).json({
          message: 'Informe o nome do jogo',
        })
      }

      const database = await gameModel.cadastrar({
        name: name.trim(),
      })

      return res.status(201).json(database)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return res.status(409).json({
          message: 'Já existe um jogo com este nome',
        })
      }

      console.error('Erro ao cadastrar jogo:', error)

      return res.status(500).json({
        message: 'Erro ao cadastrar jogo',
      })
    }
  },
  alterar: async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const { name }: { name?: string } = req.body ?? {}

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          message: 'Informe o id do jogo',
        })
      }

      if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
        return res.status(400).json({
          message: 'Informe o nome do jogo',
        })
      }

      if (name === undefined) {
        return res.status(400).json({
          message: 'Nenhum dado para atualizar',
        })
      }

      const database = await gameModel.alterar({
        id,
        name: name.trim(),
      })

      return res.status(200).json(database)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return res.status(404).json({
            message: 'Jogo não encontrado',
          })
        }

        if (error.code === 'P2002') {
          return res.status(409).json({
            message: 'Já existe um jogo com este nome',
          })
        }
      }

      console.error('Erro ao alterar jogo:', error)

      return res.status(500).json({
        message: 'Erro ao alterar jogo',
      })
    }
  },
  remover: async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          message: 'Informe o id do jogo',
        })
      }

      await gameModel.remover(id)

      return res.status(204).send()
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return res.status(404).json({
            message: 'Jogo não encontrado',
          })
        }

        if (error.code === 'P2003') {
          return res.status(409).json({
            message: 'Este jogo ainda tem times ou campeonatos cadastrados',
          })
        }
      }

      console.error('Erro ao remover jogo:', error)

      return res.status(500).json({
        message: 'Erro ao remover jogo',
      })
    }
  },
}

export default gameController
