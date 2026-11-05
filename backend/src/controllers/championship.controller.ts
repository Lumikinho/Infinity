import type { Request, Response } from 'express'

import { Prisma } from '../generated/prisma/client'
import championshipModel from '../repository/championship.repository'
import { resolveProfilePicUrl } from '../storage/storage.service'
import type { CriarChampionship } from '../types/championship.types'

type ChampionshipRecord = NonNullable<Awaited<ReturnType<typeof championshipModel.buscarPorId>>>
type ChampionshipMatchTeam = ChampionshipRecord['matches'][number]['homeTeam']

async function serializeSide(team: ChampionshipMatchTeam, externalName: string | null) {
  if (team) {
    return {
      id: team.id,
      name: team.name,
      tag: team.tag,
      logo: await resolveProfilePicUrl(team.logo),
      external: false,
    }
  }

  return {
    id: null,
    name: externalName ?? 'Time externo',
    tag: null,
    logo: null,
    external: true,
  }
}

async function serialize(championship: ChampionshipRecord) {
  return {
    ...championship,
    matches: await Promise.all(
      championship.matches.map(async (match) => ({
        ...match,
        homeTeam: await serializeSide(match.homeTeam, match.homeTeamName),
        awayTeam: await serializeSide(match.awayTeam, match.awayTeamName),
      })),
    ),
  }
}

function texto(value: unknown) {
  if (typeof value !== 'string') return null

  const trimmed = value.trim()

  return trimmed.length > 0 ? trimmed : null
}

function parsePrize(value: unknown): { value: number | null } | { error: string } {
  if (value === null || value === undefined || value === '') return { value: null as number | null }

  const number = typeof value === 'number' ? value : Number(value)

  if (!Number.isFinite(number) || number < 0) return { error: 'Premiação inválida' }

  return { value: Math.round(number) }
}

function parseDate(value: unknown) {
  const raw = texto(value)

  if (!raw) return null

  const date = new Date(raw)

  return Number.isNaN(date.getTime()) ? null : date
}

async function parseInput(
  body: Record<string, unknown>,
): Promise<{ error: string } | { data: CriarChampionship }> {
  const name = texto(body.name)

  if (!name || name.length < 2) {
    return { error: 'Informe o nome do campeonato' }
  }

  const gameId = texto(body.gameId)

  if (!gameId) {
    return { error: 'Selecione o jogo do campeonato' }
  }

  if (!(await championshipModel.buscarJogo(gameId))) {
    return { error: 'Jogo não encontrado' }
  }

  const startDate = parseDate(body.startDate)

  if (!startDate) {
    return { error: 'Informe a data de início' }
  }

  let endDate: Date | null = null

  if (texto(body.endDate)) {
    endDate = parseDate(body.endDate)

    if (!endDate) {
      return { error: 'Data de término inválida' }
    }

    if (endDate.getTime() < startDate.getTime()) {
      return { error: 'A data de término deve ser depois do início' }
    }
  }

  const prize = parsePrize(body.prizePool)

  if ('error' in prize) {
    return { error: prize.error }
  }

  return {
    data: {
      name,
      gameId,
      startDate,
      endDate,
      prizePool: prize.value,
    },
  }
}

const championshipController = {
  listar: async (_req: Request, res: Response) => {
    try {
      const database = await championshipModel.listar()

      const championships = await Promise.all(database.map((item) => serialize(item)))

      return res.status(200).json({
        database: championships,
      })
    } catch (error) {
      console.error('Erro ao listar campeonatos:', error)

      return res.status(500).json({
        message: 'Erro ao buscar campeonatos',
      })
    }
  },
  listarPorJogador: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params

      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({
          message: 'Informe o usuário do jogador',
        })
      }

      const teamIds = await championshipModel.timesDoJogador(userId)

      if (teamIds.length === 0) {
        return res.status(200).json({
          database: [],
        })
      }

      const database = await championshipModel.listarPorTimes(teamIds)

      const championships = await Promise.all(database.map((item) => serialize(item)))

      return res.status(200).json({
        database: championships,
      })
    } catch (error) {
      console.error('Erro ao listar campeonatos do jogador:', error)

      return res.status(500).json({
        message: 'Erro ao buscar campeonatos',
      })
    }
  },
  cadastrar: async (req: Request, res: Response) => {
    try {
      const parsed = await parseInput((req.body ?? {}) as Record<string, unknown>)

      if ('error' in parsed) {
        return res.status(400).json({
          message: parsed.error,
        })
      }

      const database = await championshipModel.cadastrar(parsed.data)

      return res.status(201).json(await serialize(database))
    } catch (error) {
      console.error('Erro ao cadastrar campeonato:', error)

      return res.status(500).json({
        message: 'Erro ao cadastrar campeonato',
      })
    }
  },
  alterar: async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          message: 'Informe o id do campeonato',
        })
      }

      if (!(await championshipModel.buscarPorId(id))) {
        return res.status(404).json({
          message: 'Campeonato não encontrado',
        })
      }

      const parsed = await parseInput((req.body ?? {}) as Record<string, unknown>)

      if ('error' in parsed) {
        return res.status(400).json({
          message: parsed.error,
        })
      }

      const database = await championshipModel.alterar({ id, ...parsed.data })

      return res.status(200).json(await serialize(database))
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return res.status(404).json({
            message: 'Campeonato não encontrado',
          })
        }

        if (error.code === 'P2003') {
          return res.status(400).json({
            message: 'Jogo inválido',
          })
        }
      }

      console.error('Erro ao alterar campeonato:', error)

      return res.status(500).json({
        message: 'Erro ao alterar campeonato',
      })
    }
  },
  remover: async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          message: 'Informe o id do campeonato',
        })
      }

      await championshipModel.remover(id)

      return res.status(204).send()
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return res.status(404).json({
          message: 'Campeonato não encontrado',
        })
      }

      console.error('Erro ao remover campeonato:', error)

      return res.status(500).json({
        message: 'Erro ao remover campeonato',
      })
    }
  },
}

export default championshipController
