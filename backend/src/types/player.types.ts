export interface Player {
  id: string
  nickname: string
  realName: string
  country: string
  photo: string | null
  userId: string
  createdAt: Date
}

export type CriarPlayer = Omit<Player, 'id' | 'createdAt'>

export type AtualizarPlayer = Partial<CriarPlayer> & Pick<Player, 'id'>
