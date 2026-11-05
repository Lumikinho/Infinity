export interface Team {
  id: string
  name: string
  tag: string
  logo: string | null
  gameId: string
  createdAt: Date
}

export type CriarTeam = Omit<Team, 'id' | 'createdAt'>

export type AtualizarTeam = Partial<CriarTeam> & Pick<Team, 'id'>
