import type { MatchStatus } from '../generated/prisma/enums'

export interface Match {
  id: string
  championshipId: string
  homeTeamId: string | null
  awayTeamId: string | null
  homeTeamName: string | null
  awayTeamName: string | null
  scheduledAt: Date
  status: MatchStatus
  homeScore: number | null
  awayScore: number | null
}

export type CriarMatch = Omit<Match, 'id'>

export type AtualizarMatch = CriarMatch & Pick<Match, 'id'>
