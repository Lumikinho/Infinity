import { prisma } from '../config/Database'
import type { AtualizarMatch, CriarMatch } from '../types/match.types'

const matchSelect = {
  id: true,
  championshipId: true,
  homeTeamId: true,
  awayTeamId: true,
  homeTeamName: true,
  awayTeamName: true,
  scheduledAt: true,
  status: true,
  homeScore: true,
  awayScore: true,
  homeTeam: {
    select: {
      id: true,
      name: true,
      tag: true,
      logo: true,
    },
  },
  awayTeam: {
    select: {
      id: true,
      name: true,
      tag: true,
      logo: true,
    },
  },
}

const matchModel = {
  listar: async () => {
    const database = await prisma.match.findMany({
      select: matchSelect,
      orderBy: {
        scheduledAt: 'asc',
      },
    })

    return database
  },
  buscarPorId: async (id: string) => {
    const database = await prisma.match.findUnique({
      where: { id },
      select: matchSelect,
    })

    return database
  },
  buscarCampeonato: async (id: string) => {
    const database = await prisma.championship.findUnique({
      where: { id },
      select: {
        id: true,
        gameId: true,
      },
    })

    return database
  },
  buscarTimes: async (ids: string[]) => {
    const database = await prisma.team.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        gameId: true,
      },
    })

    return database
  },
  cadastrar: async (dados: CriarMatch) => {
    const database = await prisma.match.create({
      data: dados,
      select: matchSelect,
    })

    return database
  },
  alterar: async ({ id, ...dados }: AtualizarMatch) => {
    const database = await prisma.match.update({
      where: { id },
      data: dados,
      select: matchSelect,
    })

    return database
  },
  remover: async (id: string) => {
    const database = await prisma.match.delete({
      where: { id },
      select: {
        id: true,
      },
    })

    return database
  },
}

export default matchModel
