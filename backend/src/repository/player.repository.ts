import { prisma } from '../config/Database'
import type { AtualizarPlayer, CriarPlayer } from '../types/player.types'

const playerSelect = {
  id: true,
  nickname: true,
  realName: true,
  country: true,
  photo: true,
  userId: true,
  createdAt: true,
  user: {
    select: {
      UUID: true,
      name: true,
      role: true,
    },
  },
  teams: {
    select: {
      team: {
        select: {
          id: true,
          name: true,
          tag: true,
          logo: true,
          game: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  },
}

const playersModel = {
  listar: async () => {
    const database = await prisma.players.findMany({
      select: playerSelect,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return database
  },
  buscarPorId: async (id: string) => {
    const database = await prisma.players.findUnique({
      where: { id },
      select: playerSelect,
    })

    return database
  },
  buscarPorUsuario: async (userId: string) => {
    const database = await prisma.players.findUnique({
      where: { userId },
      select: playerSelect,
    })

    return database
  },
  buscarUsuario: async (UUID: string) => {
    const database = await prisma.users.findUnique({
      where: { UUID },
      select: {
        UUID: true,
      },
    })

    return database
  },
  cadastrar: async (dados: CriarPlayer) => {
    const database = await prisma.players.create({
      data: dados,
      select: playerSelect,
    })

    return database
  },
  alterar: async (dados: AtualizarPlayer) => {
    const { id, ...resto } = dados

    const database = await prisma.players.update({
      where: { id },
      data: resto,
      select: playerSelect,
    })

    return database
  },
  remover: async (id: string) => {
    const database = await prisma.players.delete({
      where: { id },
      select: {
        id: true,
      },
    })

    return database
  },
}

export default playersModel
