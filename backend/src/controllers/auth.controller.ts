import bcrypt from 'bcrypt'
import type { Request, Response } from 'express'

import usersModel from '../repository/user.repository'
import { resolveProfilePicUrl } from '../storage/storage.service'

const authController = {
  login: async (req: Request, res: Response) => {
    try {
      const { email, password }: { email?: string; password?: string } = req.body ?? {}

      if (!email || !email.includes('@') || !password) {
        return res.status(400).json({
          message: 'Informe um email e uma senha',
        })
      }

      const usuario = await usersModel.buscarPorEmail(email.trim())

      if (!usuario) {
        return res.status(401).json({
          message: 'Email ou senha inválidos',
        })
      }

      const senhaConfere = await bcrypt.compare(password, usuario.password)

      if (!senhaConfere) {
        return res.status(401).json({
          message: 'Email ou senha inválidos',
        })
      }

      return res.status(200).json({
        user: {
          UUID: usuario.UUID,
          name: usuario.name,
          email: usuario.email,
          role: usuario.role,
          profilePic: await resolveProfilePicUrl(usuario.profilePic),
          createdAt: usuario.createdAt,
          updatedAt: usuario.updatedAt,
        },
      })
    } catch (error) {
      console.error('Erro ao autenticar usuário:', error)

      return res.status(500).json({
        message: 'Erro ao autenticar usuário',
      })
    }
  },
}

export default authController
