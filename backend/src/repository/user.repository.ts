import { prisma } from '../config/Database'
import type { CriarUsuario } from '../types/user.types'

const usersModel = {
  listar: async () => {
    const database = await prisma.users.findMany({
      select: {
        UUID: true,
        name: true,
        email: true,
        profilePic: true,
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
        password: true,
        role: true,
        profilePic: true,
      },
    })
    return database
  },
}

export default usersModel
