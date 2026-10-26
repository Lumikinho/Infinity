import usersModel from '../model/userModel'
import type { Request, Response } from 'express'
const userController = {
  listar: async (req: Request, res: Response) => {
    const database = await usersModel.listar
    if (database.length == 0) {
      return res.status(200).json({
        message: 'Não há usuarios dentro da tabela',
      })
    }
    res.status(200).json({
      database,
    })
  },
}

export default userController
