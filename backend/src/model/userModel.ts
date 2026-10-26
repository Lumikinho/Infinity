import { prisma } from '../config/Database'

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
}

export default usersModel
