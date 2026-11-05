import { prisma } from '../config/Database'
import type { CriarTeam } from '../types/team.types'

type TeamWrite = CriarTeam & { playerIds: string[] }
type TeamUpdate = Partial<CriarTeam> & { id: string; playerIds?: string[] }

const teamSelect = {
  id: true,
  name: true,
  tag: true,
  logo: true,
  gameId: true,
  createdAt: true,
  game: {
    select: {
      id: true,
      name: true,
    },
  },
  players: {
    select: {
      player: {
        select: {
          id: true,
          nickname: true,
          country: true,
          photo: true,
        },
      },
    },
  },
}

const teamModel = {
  listar: async () => {
    const database = await prisma.team.findMany({
      select: teamSelect,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return database
  },
  buscarPorId: async (id: string) => {
    const database = await prisma.team.findUnique({
      where: { id },
      select: teamSelect,
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
  contarPlayers: async (ids: string[]) => {
    const total = await prisma.players.count({
      where: {
        id: {
          in: ids,
        },
      },
    })

    return total
  },
  cadastrar: async ({ playerIds, ...dados }: TeamWrite) => {
    const id = await prisma.$transaction(async (tx) => {
      const created = await tx.team.create({
        data: dados,
        select: {
          id: true,
        },
      })

      if (playerIds.length > 0) {
        await tx.teamPlayer.createMany({
          data: playerIds.map((playerId) => ({ teamId: created.id, playerId })),
          skipDuplicates: true,
        })
      }

      return created.id
    })

    return prisma.team.findUnique({
      where: { id },
      select: teamSelect,
    })
  },
  alterar: async ({ id, playerIds, ...dados }: TeamUpdate) => {
    await prisma.$transaction(async (tx) => {
      await tx.team.update({
        where: { id },
        data: dados,
      })

      if (playerIds !== undefined) {
        await tx.teamPlayer.deleteMany({
          where: { teamId: id },
        })

        if (playerIds.length > 0) {
          await tx.teamPlayer.createMany({
            data: playerIds.map((playerId) => ({ teamId: id, playerId })),
            skipDuplicates: true,
          })
        }
      }
    })

    return prisma.team.findUnique({
      where: { id },
      select: teamSelect,
    })
  },
  remover: async (id: string) => {
    const database = await prisma.team.delete({
      where: { id },
      select: {
        id: true,
      },
    })

    return database
  },
}

export default teamModel
