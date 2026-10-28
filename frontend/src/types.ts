export type UserRole = 'USER' | 'ADMIN' | 'PLAYER'

export type ApiStatus = 'loading' | 'online' | 'offline'

export interface User {
  UUID: string
  name: string
  email: string
  profilePic: string | null
  role: UserRole
  createdAt: string
  updatedAt?: string
}

export interface UserInput {
  name: string
  email: string
  password?: string
  profilePic?: File | null
}

export type CreateUserInput = UserInput & { password: string }

export type RoleFilter = 'ALL' | UserRole
