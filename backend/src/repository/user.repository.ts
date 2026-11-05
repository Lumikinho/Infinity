import { prisma } from '../config/Database'
import type { AtualizarUsuario, CriarUsuario } from '../types/user.types'

const usersModel = {
  listar: async () => {
    const database = await prisma.users.findMany({
      select: {
        UUID: true,
        name: true,
        email: true,
        profilePic: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return database
  },
  cadastrar: async (dados: CriarUsuario) => {
    const database = await prisma.users.create({
      data: dados,
      select: {
        UUID: true,
        name: true,
        email: true,
        role: true,
        profilePic: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return database
  },
  buscarPorEmail: async (email: string) => {
    const database = await prisma.users.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    })
    return database
  },
  buscarPorUUID: async (UUID: string) => {
    const database = await prisma.users.findUnique({
      where: { UUID },
      select: {
        UUID: true,
        profilePic: true,
        player: {
          select: {
            photo: true,
          },
        },
      },
    })
    return database
  },
  alterarDados: async (dados: AtualizarUsuario) => {
    const { UUID, ...resto } = dados
    const database = await prisma.users.update({
      where: { UUID },
      data: resto,
      select: {
        UUID: true,
        name: true,
        email: true,
        role: true,
        profilePic: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return database
  },
  remover: async (UUID: string) => {
    const database = await prisma.users.delete({
      where: { UUID },
      select: {
        UUID: true,
      },
    })
    return database
  },
}

export default usersModel
