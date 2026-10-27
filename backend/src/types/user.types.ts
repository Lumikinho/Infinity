import type { UserRole } from '../generated/prisma/enums'

export interface User {
  UUID: string
  name: string
  email: string
  password: string
  profilePic: string | null
  role: UserRole
}

export type CriarUsuario = Omit<User, 'UUID'>
