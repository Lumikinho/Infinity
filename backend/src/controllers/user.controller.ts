import usersModel from '../repository/user.repository'
import type { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { Prisma } from '../generated/prisma/client'
import type { UserRole } from '../generated/prisma/enums'
import type { AtualizarUsuario } from '../types/user.types'
import { USER_ROLES } from '../types/user.types'
import {
  deleteProfilePic,
  resolveProfilePicUrl,
  saveProfilePic,
} from '../storage/storage.service'

const saltRounds = Number(process.env.SALTS ?? 12)

function parseRole(value: unknown): UserRole | null {
  if (typeof value !== 'string') return null
  if (!(USER_ROLES as readonly string[]).includes(value)) return null

  return value as UserRole
}

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

      const usuarios = await Promise.all(
        database.map(async (usuario) => ({
          ...usuario,
          profilePic: await resolveProfilePicUrl(usuario.profilePic),
        })),
      )

      return res.status(200).json({
        database: usuarios,
      })
    } catch (error) {
      console.error('Erro ao listar usuários:', error)

      return res.status(500).json({
        message: 'Erro ao buscar usuários',
      })
    }
  },
  cadastrar: async (req: Request, res: Response) => {
    let imagemEnviada: string | null = null

    try {
      const { name, email, password }: { name: string; email: string; password: string } = req.body
      const role = parseRole(req.body?.role ?? 'USER')

      if (!role) {
        return res.status(400).json({
          message: 'Função inválida',
        })
      }

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

      if (req.file) {
        imagemEnviada = await saveProfilePic(req.file)
      }

      const hashPassword = await bcrypt.hash(password, saltRounds)

      const database = await usersModel.cadastrar({
        name: name,
        email: email,
        password: hashPassword,
        profilePic: imagemEnviada,
        role: role,
      })

      // A imagem agora pertence ao usuário; não deve ser removida no catch.
      imagemEnviada = null

      return res.status(201).json({
        ...database,
        profilePic: await resolveProfilePicUrl(database.profilePic),
      })
    } catch (error) {
      if (imagemEnviada) await deleteProfilePic(imagemEnviada)

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return res.status(409).json({
          message: 'Este email já está em uso',
        })
      }

      console.error('Erro ao cadastrar usuário:', error)

      return res.status(500).json({
        message: 'Erro ao cadastrar usuário',
      })
    }
  },
  alterar: async (req: Request, res: Response) => {
    let imagemEnviada: string | null = null

    try {
      const { UUID } = req.params
      const { name, email, password, role }: {
        name?: string
        email?: string
        password?: string
        role?: string
      } = req.body ?? {}

      if (!UUID || typeof UUID !== 'string') {
        return res.status(400).json({
          message: 'Informe o UUID do usuário',
        })
      }
      if (name !== undefined && (typeof name !== 'string' || name.trim().length <= 3)) {
        return res.status(400).json({
          message: 'Insira um name válido',
        })
      }
      if (email !== undefined && (typeof email !== 'string' || !email.includes('@'))) {
        return res.status(400).json({
          message: 'Insira um email válido',
        })
      }
      if (password !== undefined && (typeof password !== 'string' || password.length <= 3)) {
        return res.status(400).json({
          message: 'Insira uma senha maior que 3 caracteres',
        })
      }

      const usuarioAtual = await usersModel.buscarPorUUID(UUID)

      if (!usuarioAtual) {
        return res.status(404).json({
          message: 'Usuário não encontrado',
        })
      }

      let funcao: UserRole | undefined

      if (role !== undefined) {
        const parsed = parseRole(role)

        if (!parsed) {
          return res.status(400).json({
            message: 'Função inválida',
          })
        }

        funcao = parsed
      }

      const dados: AtualizarUsuario = { UUID }

      if (name !== undefined) dados.name = name.trim()
      if (email !== undefined) dados.email = email.trim()
      if (funcao !== undefined) dados.role = funcao
      if (password !== undefined) dados.password = await bcrypt.hash(password, saltRounds)
      if (req.file) {
        imagemEnviada = await saveProfilePic(req.file)
        dados.profilePic = imagemEnviada
      }

      if (Object.keys(dados).length === 1) {
        return res.status(400).json({
          message: 'Nenhum dado para atualizar',
        })
      }

      const database = await usersModel.alterarDados(dados)

      if (imagemEnviada) {
        const imagemAnterior = usuarioAtual.profilePic

        imagemEnviada = null
        if (imagemAnterior) await deleteProfilePic(imagemAnterior)
      }

      return res.status(200).json({
        ...database,
        profilePic: await resolveProfilePicUrl(database.profilePic),
      })
    } catch (error) {
      if (imagemEnviada) await deleteProfilePic(imagemEnviada)

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return res.status(404).json({
            message: 'Usuário não encontrado',
          })
        }
        if (error.code === 'P2002') {
          return res.status(409).json({
            message: 'Este email já está em uso',
          })
        }
      }

      console.error('Erro ao alterar usuário:', error)

      return res.status(500).json({
        message: 'Erro ao alterar usuário',
      })
    }
  },
  remover: async (req: Request, res: Response) => {
    try {
      const { UUID } = req.params

      if (!UUID || typeof UUID !== 'string') {
        return res.status(400).json({
          message: 'Informe o UUID do usuário',
        })
      }

      const usuario = await usersModel.buscarPorUUID(UUID)

      if (!usuario) {
        return res.status(404).json({
          message: 'Usuário não encontrado',
        })
      }

      await usersModel.remover(UUID)

      await Promise.all([
        deleteProfilePic(usuario.profilePic),
        deleteProfilePic(usuario.player?.photo),
      ])

      return res.status(204).send()
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return res.status(404).json({
          message: 'Usuário não encontrado',
        })
      }

      console.error('Erro ao remover usuário:', error)

      return res.status(500).json({
        message: 'Erro ao remover usuário',
      })
    }
  },
}

export default userController
