import type { Request, Response } from 'express'

import { Prisma } from '../generated/prisma/client'
import teamModel from '../repository/team.repository'
import {
  deleteProfilePic,
  resolveProfilePicUrl,
  saveProfilePic,
} from '../storage/storage.service'

type TeamRecord = NonNullable<Awaited<ReturnType<typeof teamModel.buscarPorId>>>

async function serialize(team: TeamRecord) {
  return {
    ...team,
    logo: await resolveProfilePicUrl(team.logo),
    players: await Promise.all(
      team.players.map(async ({ player }) => ({
        ...player,
        photo: await resolveProfilePicUrl(player.photo),
      })),
    ),
  }
}

function texto(value: unknown) {
  if (typeof value !== 'string') return null

  const trimmed = value.trim()

  return trimmed.length > 0 ? trimmed : null
}

function parsePlayerIds(value: unknown): string[] | null | undefined {
  if (value === undefined) return undefined

  let list: unknown = value

  if (typeof value === 'string') {
    if (!value.trim()) return []

    try {
      list = JSON.parse(value)
    } catch {
      return null
    }
  }

  if (!Array.isArray(list) || !list.every((item) => typeof item === 'string')) {
    return null
  }

  return [...new Set(list.map((item) => item.trim()).filter(Boolean))]
}

async function jogadoresValidos(playerIds: string[]) {
  if (playerIds.length === 0) return true

  return (await teamModel.contarPlayers(playerIds)) === playerIds.length
}

const teamController = {
  listar: async (_req: Request, res: Response) => {
    try {
      const database = await teamModel.listar()

      const teams = await Promise.all(database.map((team) => serialize(team)))

      return res.status(200).json({
        database: teams,
      })
    } catch (error) {
      console.error('Erro ao listar times:', error)

      return res.status(500).json({
        message: 'Erro ao buscar times',
      })
    }
  },
  buscar: async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          message: 'Informe o id do time',
        })
      }

      const database = await teamModel.buscarPorId(id)

      if (!database) {
        return res.status(404).json({
          message: 'Time não encontrado',
        })
      }

      return res.status(200).json(await serialize(database))
    } catch (error) {
      console.error('Erro ao buscar time:', error)

      return res.status(500).json({
        message: 'Erro ao buscar time',
      })
    }
  },
  cadastrar: async (req: Request, res: Response) => {
    let imagemEnviada: string | null = null

    try {
      const name = texto(req.body?.name)
      const tag = texto(req.body?.tag)
      const gameId = texto(req.body?.gameId)

      if (!name || !tag) {
        return res.status(400).json({
          message: 'Preencha nome e tag do time',
        })
      }

      if (!gameId) {
        return res.status(400).json({
          message: 'Selecione o jogo do time',
        })
      }

      const jogo = await teamModel.buscarJogo(gameId)

      if (!jogo) {
        return res.status(400).json({
          message: 'Jogo não encontrado',
        })
      }

      const parsedPlayers = parsePlayerIds(req.body?.playerIds)

      if (parsedPlayers === null) {
        return res.status(400).json({
          message: 'Lista de jogadores inválida',
        })
      }

      const playerIds = parsedPlayers ?? []

      if (!(await jogadoresValidos(playerIds))) {
        return res.status(400).json({
          message: 'Um ou mais jogadores não foram encontrados',
        })
      }

      if (req.file) {
        imagemEnviada = await saveProfilePic(req.file)
      }

      const database = await teamModel.cadastrar({
        name,
        tag,
        logo: imagemEnviada,
        gameId,
        playerIds,
      })

      imagemEnviada = null

      if (!database) {
        return res.status(500).json({
          message: 'Erro ao cadastrar time',
        })
      }

      return res.status(201).json(await serialize(database))
    } catch (error) {
      if (imagemEnviada) await deleteProfilePic(imagemEnviada)

      console.error('Erro ao cadastrar time:', error)

      return res.status(500).json({
        message: 'Erro ao cadastrar time',
      })
    }
  },
  alterar: async (req: Request, res: Response) => {
    let imagemEnviada: string | null = null

    try {
      const { id } = req.params

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          message: 'Informe o id do time',
        })
      }

      const atual = await teamModel.buscarPorId(id)

      if (!atual) {
        return res.status(404).json({
          message: 'Time não encontrado',
        })
      }

      const dados: {
        name?: string
        tag?: string
        logo?: string | null
        gameId?: string
      } = {}

      const { name, tag, gameId } = req.body ?? {}

      if (name !== undefined) {
        const valor = texto(name)

        if (!valor) {
          return res.status(400).json({ message: 'Informe o nome do time' })
        }

        dados.name = valor
      }

      if (tag !== undefined) {
        const valor = texto(tag)

        if (!valor) {
          return res.status(400).json({ message: 'Informe a tag do time' })
        }

        dados.tag = valor
      }

      if (gameId !== undefined) {
        const valor = texto(gameId)

        if (!valor) {
          return res.status(400).json({ message: 'Selecione o jogo do time' })
        }

        const jogo = await teamModel.buscarJogo(valor)

        if (!jogo) {
          return res.status(400).json({ message: 'Jogo não encontrado' })
        }

        dados.gameId = valor
      }

      const playerIds = parsePlayerIds(req.body?.playerIds)

      if (playerIds === null) {
        return res.status(400).json({
          message: 'Lista de jogadores inválida',
        })
      }

      if (playerIds !== undefined && !(await jogadoresValidos(playerIds))) {
        return res.status(400).json({
          message: 'Um ou mais jogadores não foram encontrados',
        })
      }

      if (req.file) {
        imagemEnviada = await saveProfilePic(req.file)
        dados.logo = imagemEnviada
      }

      if (Object.keys(dados).length === 0 && playerIds === undefined) {
        return res.status(400).json({
          message: 'Nenhum dado para atualizar',
        })
      }

      const database = await teamModel.alterar({
        id,
        ...dados,
        playerIds,
      })

      if (imagemEnviada) {
        await deleteProfilePic(atual.logo)
        imagemEnviada = null
      }

      if (!database) {
        return res.status(500).json({
          message: 'Erro ao alterar time',
        })
      }

      return res.status(200).json(await serialize(database))
    } catch (error) {
      if (imagemEnviada) await deleteProfilePic(imagemEnviada)

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return res.status(404).json({
            message: 'Time não encontrado',
          })
        }

        if (error.code === 'P2003') {
          return res.status(400).json({
            message: 'Jogo ou jogador inválido',
          })
        }
      }

      console.error('Erro ao alterar time:', error)

      return res.status(500).json({
        message: 'Erro ao alterar time',
      })
    }
  },
  remover: async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          message: 'Informe o id do time',
        })
      }

      const atual = await teamModel.buscarPorId(id)

      if (!atual) {
        return res.status(404).json({
          message: 'Time não encontrado',
        })
      }

      await teamModel.remover(id)
      await deleteProfilePic(atual.logo)

      return res.status(204).send()
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return res.status(404).json({
          message: 'Time não encontrado',
        })
      }

      console.error('Erro ao remover time:', error)

      return res.status(500).json({
        message: 'Erro ao remover time',
      })
    }
  },
}

export default teamController
