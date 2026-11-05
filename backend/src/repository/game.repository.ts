import { prisma } from '../config/Database'
import type { AtualizarGame, CriarGame } from '../types/game.types'

const gameModel = {
  listar: async () => {
    const database = await prisma.game.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            teams: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return database
  },
  buscarPorId: async (id: string) => {
    const database = await prisma.game.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    })

    return database
  },
  cadastrar: async (dados: CriarGame) => {
    const database = await prisma.game.create({
      data: dados,
      select: {
        id: true,
        name: true,
      },
    })

    return database
  },
  alterar: async (dados: AtualizarGame) => {
    const { id, ...resto } = dados

    const database = await prisma.game.update({
      where: { id },
      data: resto,
      select: {
        id: true,
        name: true,
      },
    })

    return database
  },
  remover: async (id: string) => {
    const database = await prisma.game.delete({
      where: { id },
      select: {
        id: true,
      },
    })

    return database
  },
}

export default gameModel
