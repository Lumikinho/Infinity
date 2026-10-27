import usersModel from '../repository/user.repository'
import type { Request, Response } from 'express'
import bcrypt from 'bcrypt'

const saltRounds = Number(process.env.SALTS ?? 12)

const userController = {
  listar: async (req: Request, res: Response) => {
    try {
      const database = await usersModel.listar()

      if (database.length === 0) {
        return res.status(200).json({
          message: 'Não há usuários na tabela',
          database: [],
        })
      }

      return res.status(200).json({
        database,
      })
    } catch (error) {
      console.error('Erro ao listar usuários:', error)

      return res.status(500).json({
        message: 'Erro ao buscar usuários',
      })
    }
  },
  cadastrar: async (req: Request, res: Response) => {
    try {
      const { name, email, password }: { name: string; email: string; password: string } = req.body
      const role = 'USER'
      const profilePic = req.file?.filename ?? null

      if (!name || name.length <= 3) {
        return res.status(400).json({
          message: 'Insira um name válido',
        })
      }
      if (!email || !email.includes('@')) {
        return res.status(400).json({
          message: 'Insira um email válido',
        })
      }
      if (!password || password.length <= 3) {
        return res.status(400).json({
          message: 'Insira uma senha maior que 3 caracteres',
        })
      }

      const hashPassword = await bcrypt.hash(password, saltRounds)

      const database = await usersModel.cadastrar({
        name: name,
        email: email,
        password: hashPassword,
        profilePic: profilePic,
        role: role,
      })

      return res.status(201).json(database)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error })
    }
  },
}

export default userController
