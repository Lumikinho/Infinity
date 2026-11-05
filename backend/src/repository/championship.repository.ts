import { prisma } from '../config/Database'
import type { AtualizarChampionship, CriarChampionship } from '../types/championship.types'

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

const championshipSelect = {
  id: true,
  name: true,
  gameId: true,
  startDate: true,
  endDate: true,
  prizePool: true,
  createdAt: true,
  game: {
    select: {
      id: true,
      name: true,
    },
  },
}

const championshipWithMatches = {
  ...championshipSelect,
  matches: {
    select: matchSelect,
    orderBy: {
      scheduledAt: 'asc' as const,
    },
  },
}

const championshipModel = {
  listar: async () => {
    const database = await prisma.championship.findMany({
      select: championshipWithMatches,
      orderBy: {
        startDate: 'desc',
      },
    })

    return database
  },
  listarPorTimes: async (teamIds: string[]) => {
    const database = await prisma.championship.findMany({
      where: {
        matches: {
          some: {
            OR: [{ homeTeamId: { in: teamIds } }, { awayTeamId: { in: teamIds } }],
          },
        },
      },
      select: {
        ...championshipSelect,
        matches: {
          where: {
            OR: [{ homeTeamId: { in: teamIds } }, { awayTeamId: { in: teamIds } }],
          },
          select: matchSelect,
          orderBy: {
            scheduledAt: 'asc' as const,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    })

    return database
  },
  buscarPorId: async (id: string) => {
    const database = await prisma.championship.findUnique({
      where: { id },
      select: championshipWithMatches,
    })

    return database
  },
  buscarJogo: async (id: string) => {
    const database = await prisma.game.findUnique({
      where: { id },
      select: {
        id: true,
      },
    })

    return database
  },
  timesDoJogador: async (userId: string) => {
    const database = await prisma.teamPlayer.findMany({
      where: {
        player: {
          userId,
        },
      },
      select: {
        teamId: true,
      },
    })

    return database.map((item) => item.teamId)
  },
  cadastrar: async (dados: CriarChampionship) => {
    const database = await prisma.championship.create({
      data: dados,
      select: championshipWithMatches,
    })

    return database
  },
  alterar: async ({ id, ...dados }: AtualizarChampionship) => {
    const database = await prisma.championship.update({
      where: { id },
      data: dados,
      select: championshipWithMatches,
    })

    return database
  },
  remover: async (id: string) => {
    const database = await prisma.championship.delete({
      where: { id },
      select: {
        id: true,
      },
    })

    return database
  },
}

export default championshipModel
