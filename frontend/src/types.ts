export type UserRole = 'USER' | 'ADMIN' | 'PLAYER'

export interface User {
  UUID: string
  name: string
  email: string
  profilePic: string | null
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface UserInput {
  name: string
  email: string
  role: UserRole
  password?: string
  profilePic?: File | null
}

export interface Game {
  id: string
  name: string
  teamsCount: number
}

export interface PlayerTeam {
  id: string
  name: string
  tag: string
  logo: string | null
  game: {
    id: string
    name: string
  }
}

export interface Player {
  id: string
  nickname: string
  realName: string
  country: string
  photo: string | null
  userId: string
  createdAt: string
  user: {
    UUID: string
    name: string
    role: UserRole
  }
  teams: PlayerTeam[]
}

export interface PlayerInput {
  nickname: string
  realName: string
  country: string
  userId: string
  photo?: File | null
}

export interface TeamPlayer {
  id: string
  nickname: string
  country: string
  photo: string | null
}

export interface Team {
  id: string
  name: string
  tag: string
  logo: string | null
  gameId: string
  createdAt: string
  game: {
    id: string
    name: string
  }
  players: TeamPlayer[]
}

export interface TeamInput {
  name: string
  tag: string
  gameId: string
  playerIds: string[]
  logo?: File | null
}

export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED'

export interface MatchTeam {
  id: string | null
  name: string
  tag: string | null
  logo: string | null
  external: boolean
}

export interface ChampionshipMatch {
  id: string
  championshipId: string
  scheduledAt: string
  status: MatchStatus
  homeScore: number | null
  awayScore: number | null
  homeTeam: MatchTeam
  awayTeam: MatchTeam
}

export interface Championship {
  id: string
  name: string
  gameId: string
  startDate: string
  endDate: string | null
  prizePool: number | null
  createdAt: string
  game: {
    id: string
    name: string
  }
  matches: ChampionshipMatch[]
}

export interface ChampionshipInput {
  name: string
  gameId: string
  startDate: string
  endDate: string | null
  prizePool: number | null
}

export interface MatchInput {
  championshipId: string
  homeTeamId: string | null
  awayTeamId: string | null
  homeTeamName: string | null
  awayTeamName: string | null
  scheduledAt: string
  status: MatchStatus
  homeScore: number | null
  awayScore: number | null
}
