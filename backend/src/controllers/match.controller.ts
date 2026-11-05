import type { Request, Response } from 'express'

import { Prisma } from '../generated/prisma/client'
import type { MatchStatus } from '../generated/prisma/enums'
import matchModel from '../repository/match.repository'
import { resolveProfilePicUrl } from '../storage/storage.service'
import type { CriarMatch } from '../types/match.types'

type MatchRecord = NonNullable<Awaited<ReturnType<typeof matchModel.buscarPorId>>>
type MatchTeamRecord = MatchRecord['homeTeam']

async function serializeSide(team: MatchTeamRecord, externalName: string | null) {
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

async function serialize(match: MatchRecord) {
  return {
    ...match,
    homeTeam: await serializeSide(match.homeTeam, match.homeTeamName),
    awayTeam: await serializeSide(match.awayTeam, match.awayTeamName),
  }
}

function texto(value: unknown) {
  if (typeof value !== 'string') return null

  const trimmed = value.trim()

  return trimmed.length > 0 ? trimmed : null
}

function parseDate(value: unknown) {
  const raw = texto(value)

  if (!raw) return null

  const date = new Date(raw)

  return Number.isNaN(date.getTime()) ? null : date
}

function parseScore(value: unknown): number | null | undefined {
  if (value === undefined || value === null || value === '') return null

  const parsed = typeof value === 'number' ? value : Number(value)

  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 999) return undefined

  return parsed
}

function isStatus(value: unknown): value is MatchStatus {
  return value === 'SCHEDULED' || value === 'LIVE' || value === 'FINISHED'
}

type MatchSide = { teamId: string | null; name: string | null }

function parseSide(
  body: Record<string, unknown>,
  prefix: 'home' | 'away',
): { error: string } | MatchSide {
  const teamId = texto(body[`${prefix}TeamId`])

  if (teamId) {
    return { teamId, name: null }
  }

  const name = texto(body[`${prefix}TeamName`])

  if (!name) {
    return {
      error: prefix === 'home' ? 'Informe o time da casa' : 'Informe o time visitante',
    }
  }

  if (name.length < 2) {
    return { error: 'O nome do time externo deve ter ao menos 2 caracteres' }
  }

  return { teamId: null, name }
}

async function parseInput(
  body: Record<string, unknown>,
): Promise<{ error: string } | { data: CriarMatch }> {
  const championshipId = texto(body.championshipId)

  if (!championshipId) {
    return { error: 'Selecione o campeonato da partida' }
  }

  const home = parseSide(body, 'home')

  if ('error' in home) return home

  const away = parseSide(body, 'away')

  if ('error' in away) return away

  if (home.teamId && away.teamId && home.teamId === away.teamId) {
    return { error: 'Escolha dois times diferentes' }
  }

  if (
    !home.teamId &&
    !away.teamId &&
    home.name &&
    away.name &&
    home.name.toLowerCase() === away.name.toLowerCase()
  ) {
    return { error: 'Escolha dois times diferentes' }
  }

  const championship = await matchModel.buscarCampeonato(championshipId)

  if (!championship) {
    return { error: 'Campeonato não encontrado' }
  }

  const localIds = [home.teamId, away.teamId].filter((id): id is string => Boolean(id))

  if (localIds.length > 0) {
    const teams = await matchModel.buscarTimes(localIds)

    if (teams.length !== localIds.length) {
      return { error: 'Um ou mais times não foram encontrados' }
    }

    if (teams.some((team) => team.gameId !== championship.gameId)) {
      return { error: 'Os times do sistema precisam ser do mesmo jogo do campeonato' }
    }
  }

  const scheduledAt = parseDate(body.scheduledAt)

  if (!scheduledAt) {
    return { error: 'Informe a data da partida' }
  }

  const status = body.status ?? 'SCHEDULED'

  if (!isStatus(status)) {
    return { error: 'Status da partida inválido' }
  }

  const homeScore = parseScore(body.homeScore)
  const awayScore = parseScore(body.awayScore)

  if (homeScore === undefined || awayScore === undefined) {
    return { error: 'Placar inválido' }
  }

  if (status === 'FINISHED' && (homeScore === null || awayScore === null)) {
    return { error: 'Informe o placar final da partida' }
  }

  return {
    data: {
      championshipId,
      homeTeamId: home.teamId,
      awayTeamId: away.teamId,
      homeTeamName: home.name,
      awayTeamName: away.name,
      scheduledAt,
      status,
      homeScore: status === 'SCHEDULED' ? null : homeScore,
      awayScore: status === 'SCHEDULED' ? null : awayScore,
    },
  }
}

const matchController = {
  listar: async (_req: Request, res: Response) => {
    try {
      const database = await matchModel.listar()

      const matches = await Promise.all(database.map((item) => serialize(item)))

      return res.status(200).json({
        database: matches,
      })
    } catch (error) {
      console.error('Erro ao listar partidas:', error)

      return res.status(500).json({
        message: 'Erro ao buscar partidas',
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

      const database = await matchModel.cadastrar(parsed.data)

      return res.status(201).json(await serialize(database))
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        return res.status(400).json({
          message: 'Campeonato ou time inválido',
        })
      }

      console.error('Erro ao cadastrar partida:', error)

      return res.status(500).json({
        message: 'Erro ao cadastrar partida',
      })
    }
  },
  alterar: async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          message: 'Informe o id da partida',
        })
      }

      if (!(await matchModel.buscarPorId(id))) {
        return res.status(404).json({
          message: 'Partida não encontrada',
        })
      }

      const parsed = await parseInput((req.body ?? {}) as Record<string, unknown>)

      if ('error' in parsed) {
        return res.status(400).json({
          message: parsed.error,
        })
      }

      const database = await matchModel.alterar({ id, ...parsed.data })

      return res.status(200).json(await serialize(database))
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return res.status(404).json({
            message: 'Partida não encontrada',
          })
        }

        if (error.code === 'P2003') {
          return res.status(400).json({
            message: 'Campeonato ou time inválido',
          })
        }
      }

      console.error('Erro ao alterar partida:', error)

      return res.status(500).json({
        message: 'Erro ao alterar partida',
      })
    }
  },
  remover: async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          message: 'Informe o id da partida',
        })
      }

      await matchModel.remover(id)

      return res.status(204).send()
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return res.status(404).json({
          message: 'Partida não encontrada',
        })
      }

      console.error('Erro ao remover partida:', error)

      return res.status(500).json({
        message: 'Erro ao remover partida',
      })
    }
  },
}

export default matchController
