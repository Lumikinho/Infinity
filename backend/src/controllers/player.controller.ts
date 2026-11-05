import type { Request, Response } from 'express'

import { Prisma } from '../generated/prisma/client'
import playersModel from '../repository/player.repository'
import {
  deleteProfilePic,
  resolveProfilePicUrl,
  saveProfilePic,
} from '../storage/storage.service'
import type { AtualizarPlayer } from '../types/player.types'

type PlayerRecord = NonNullable<Awaited<ReturnType<typeof playersModel.buscarPorId>>>

async function serialize(player: PlayerRecord) {
  return {
    ...player,
    photo: await resolveProfilePicUrl(player.photo),
    teams: player.teams.map(({ team }) => team),
  }
}

function texto(value: unknown) {
  if (typeof value !== 'string') return null

  const trimmed = value.trim()

  return trimmed.length > 0 ? trimmed : null
}

const playerController = {
  listar: async (_req: Request, res: Response) => {
    try {
      const database = await playersModel.listar()

      const players = await Promise.all(database.map((player) => serialize(player)))

      return res.status(200).json({
        database: players,
      })
    } catch (error) {
      console.error('Erro ao listar jogadores:', error)

      return res.status(500).json({
        message: 'Erro ao buscar jogadores',
      })
    }
  },
  buscar: async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          message: 'Informe o id do jogador',
        })
      }

      const database = await playersModel.buscarPorId(id)

      if (!database) {
        return res.status(404).json({
          message: 'Jogador não encontrado',
        })
      }

      return res.status(200).json(await serialize(database))
    } catch (error) {
      console.error('Erro ao buscar jogador:', error)

      return res.status(500).json({
        message: 'Erro ao buscar jogador',
      })
    }
  },
  buscarPorUsuario: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params

      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({
          message: 'Informe o usuário do jogador',
        })
      }

      const database = await playersModel.buscarPorUsuario(userId)

      if (!database) {
        return res.status(404).json({
          message: 'Jogador não encontrado',
        })
      }

      return res.status(200).json(await serialize(database))
    } catch (error) {
      console.error('Erro ao buscar jogador por usuário:', error)

      return res.status(500).json({
        message: 'Erro ao buscar jogador',
      })
    }
  },
  cadastrar: async (req: Request, res: Response) => {
    let imagemEnviada: string | null = null

    try {
      const nickname = texto(req.body?.nickname)
      const realName = texto(req.body?.realName)
      const country = texto(req.body?.country)
      const userId = texto(req.body?.userId)

      if (!nickname || !realName || !country) {
        return res.status(400).json({
          message: 'Preencha nickname, nome real e país',
        })
      }

      if (!userId) {
        return res.status(400).json({
          message: 'Selecione a conta do jogador',
        })
      }

      const usuario = await playersModel.buscarUsuario(userId)

      if (!usuario) {
        return res.status(400).json({
          message: 'Conta não encontrada',
        })
      }

      const existente = await playersModel.buscarPorUsuario(userId)

      if (existente) {
        return res.status(409).json({
          message: 'Esta conta já tem um jogador',
        })
      }

      if (req.file) {
        imagemEnviada = await saveProfilePic(req.file)
      }

      const database = await playersModel.cadastrar({
        nickname,
        realName,
        country,
        photo: imagemEnviada,
        userId,
      })

      imagemEnviada = null

      return res.status(201).json(await serialize(database))
    } catch (error) {
      if (imagemEnviada) await deleteProfilePic(imagemEnviada)

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return res.status(409).json({
          message: 'Esta conta já tem um jogador',
        })
      }

      console.error('Erro ao cadastrar jogador:', error)

      return res.status(500).json({
        message: 'Erro ao cadastrar jogador',
      })
    }
  },
  alterar: async (req: Request, res: Response) => {
    let imagemEnviada: string | null = null

    try {
      const { id } = req.params

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          message: 'Informe o id do jogador',
        })
      }

      const atual = await playersModel.buscarPorId(id)

      if (!atual) {
        return res.status(404).json({
          message: 'Jogador não encontrado',
        })
      }

      const dados: AtualizarPlayer = { id }
      const { nickname, realName, country, userId } = req.body ?? {}

      if (nickname !== undefined) {
        const valor = texto(nickname)

        if (!valor) {
          return res.status(400).json({ message: 'Informe o nickname' })
        }

        dados.nickname = valor
      }

      if (realName !== undefined) {
        const valor = texto(realName)

        if (!valor) {
          return res.status(400).json({ message: 'Informe o nome real' })
        }

        dados.realName = valor
      }

      if (country !== undefined) {
        const valor = texto(country)

        if (!valor) {
          return res.status(400).json({ message: 'Informe o país' })
        }

        dados.country = valor
      }

      if (userId !== undefined) {
        const valor = texto(userId)

        if (!valor) {
          return res.status(400).json({ message: 'Selecione a conta do jogador' })
        }

        if (valor !== atual.userId) {
          const usuario = await playersModel.buscarUsuario(valor)

          if (!usuario) {
            return res.status(400).json({ message: 'Conta não encontrada' })
          }

          const existente = await playersModel.buscarPorUsuario(valor)

          if (existente && existente.id !== id) {
            return res.status(409).json({ message: 'Esta conta já tem um jogador' })
          }
        }

        dados.userId = valor
      }

      if (req.file) {
        imagemEnviada = await saveProfilePic(req.file)
        dados.photo = imagemEnviada
      }

      if (Object.keys(dados).length === 1) {
        return res.status(400).json({
          message: 'Nenhum dado para atualizar',
        })
      }

      const database = await playersModel.alterar(dados)

      if (imagemEnviada) {
        await deleteProfilePic(atual.photo)
        imagemEnviada = null
      }

      return res.status(200).json(await serialize(database))
    } catch (error) {
      if (imagemEnviada) await deleteProfilePic(imagemEnviada)

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return res.status(404).json({
            message: 'Jogador não encontrado',
          })
        }

        if (error.code === 'P2002') {
          return res.status(409).json({
            message: 'Esta conta já tem um jogador',
          })
        }
      }

      console.error('Erro ao alterar jogador:', error)

      return res.status(500).json({
        message: 'Erro ao alterar jogador',
      })
    }
  },
  remover: async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          message: 'Informe o id do jogador',
        })
      }

      const atual = await playersModel.buscarPorId(id)

      if (!atual) {
        return res.status(404).json({
          message: 'Jogador não encontrado',
        })
      }

      await playersModel.remover(id)
      await deleteProfilePic(atual.photo)

      return res.status(204).send()
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return res.status(404).json({
          message: 'Jogador não encontrado',
        })
      }

      console.error('Erro ao remover jogador:', error)

      return res.status(500).json({
        message: 'Erro ao remover jogador',
      })
    }
  },
}

export default playerController
