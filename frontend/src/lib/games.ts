import type { Championship, Team, TeamPlayer } from '../types'

export interface GameSummary {
  teamsCount: number
  players: TeamPlayer[]
  championships: Championship[]
  prizePool: number
  matchCount: number
}

export function summarizeGame(
  gameId: string,
  teams: Team[],
  championships: Championship[],
): GameSummary {
  const gameTeams = teams.filter((team) => team.game.id === gameId)
  const playersById = new Map<string, TeamPlayer>()

  for (const team of gameTeams) {
    for (const player of team.players) {
      if (!playersById.has(player.id)) playersById.set(player.id, player)
    }
  }

  const gameChampionships = championships.filter(
    (championship) => championship.gameId === gameId,
  )

  const prizePool = gameChampionships.reduce(
    (total, championship) => total + (championship.prizePool ?? 0),
    0,
  )

  const matchCount = gameChampionships.reduce(
    (total, championship) => total + championship.matches.length,
    0,
  )

  return {
    teamsCount: gameTeams.length,
    players: [...playersById.values()],
    championships: gameChampionships,
    prizePool,
    matchCount,
  }
}

export function gameSummaryLabels(summary: GameSummary) {
  return [
    `${summary.teamsCount} ${summary.teamsCount === 1 ? 'time' : 'times'}`,
    `${summary.players.length} ${summary.players.length === 1 ? 'jogador' : 'jogadores'}`,
    `${summary.championships.length} ${
      summary.championships.length === 1 ? 'campeonato' : 'campeonatos'
    }`,
  ].join(' · ')
}
