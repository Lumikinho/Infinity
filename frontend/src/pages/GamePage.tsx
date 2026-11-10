import { useEffect, useMemo, useState } from 'react'

import { LoadError } from '../components/LoadError'
import { PlayerPortrait } from '../components/PlayerPortrait'
import { TeamLogo } from '../components/TeamLogo'
import { imageUrl, listChampionships, listGames, listTeams } from '../lib/localData'
import { cn, formatCurrency, formatDate, matchStatusLabels } from '../lib/format'
import { gameSummaryLabels, summarizeGame } from '../lib/games'
import { gameSlug, playerHref, screenHashes } from '../lib/routes'
import { primaryButtonClass, secondaryButtonClass } from '../lib/styles'
import type {
  Championship,
  ChampionshipMatch,
  Game,
  MatchStatus,
  MatchTeam,
  Team,
  TeamPlayer,
} from '../types'

type LoadState = 'loading' | 'ready' | 'error'

interface GamePageProps {
  identifier: string
}

interface CalendarEntry {
  championship: Championship
  match: ChampionshipMatch
}

const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short' })
const dayFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit' })
const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
})
const fullDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

const statusOrder: Record<MatchStatus, number> = {
  LIVE: 0,
  SCHEDULED: 1,
  FINISHED: 2,
}

function StatusBadge({ status }: { status: MatchStatus }) {
  if (status === 'LIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-sm bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-canvas">
        <span className="size-1.5 rounded-full bg-canvas" />
        {matchStatusLabels[status]}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'rounded-sm border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em]',
        status === 'FINISHED'
          ? 'border-line bg-neutral-100 text-muted'
          : 'border-line-strong bg-transparent text-ink',
      )}
    >
      {matchStatusLabels[status]}
    </span>
  )
}

function TeamSide({ team }: { team: MatchTeam }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <TeamLogo name={team.name} src={imageUrl(team.logo)} size="sm" />
      <span className="truncate font-display text-sm font-semibold uppercase tracking-[0.02em]">
        {team.name}
      </span>
      {team.external && (
        <span className="shrink-0 border border-line bg-neutral-50 px-1 text-[10px] uppercase tracking-[0.08em] text-muted">
          externo
        </span>
      )}
    </span>
  )
}

function RosterCard({ player }: { player: TeamPlayer }) {
  return (
    <a
      href={playerHref(player.id)}
      className="group flex h-full flex-col overflow-hidden border border-line bg-surface transition hover:border-accent/60 hover:bg-white/[0.02]"
    >
      <div className="aspect-square w-full overflow-hidden border-b border-line bg-neutral-100">
        <PlayerPortrait
          name={player.nickname}
          src={imageUrl(player.photo)}
          className="transition duration-300 group-hover:scale-[1.02]"
          initialsClassName="text-4xl"
        />
      </div>

      <div className="p-3.5">
        <p className="truncate font-display text-lg font-semibold uppercase leading-tight tracking-[0.02em] transition group-hover:text-accent">
          {player.nickname}
        </p>
        <p className="truncate text-[12px] text-muted">{player.country}</p>
      </div>
    </a>
  )
}

function findGame(games: Game[], identifier: string) {
  const slug = gameSlug(identifier)

  return (
    games.find((game) => game.id === identifier) ??
    games.find((game) => gameSlug(game.name) === slug) ??
    null
  )
}

function buildCalendar(championships: Championship[]): CalendarEntry[] {
  return championships
    .flatMap((championship) =>
      championship.matches.map((match) => ({ championship, match })),
    )
    .sort((a, b) => {
      const byStatus = statusOrder[a.match.status] - statusOrder[b.match.status]

      if (byStatus !== 0) return byStatus

      const byDate =
        new Date(a.match.scheduledAt).getTime() - new Date(b.match.scheduledAt).getTime()

      return a.match.status === 'FINISHED' ? -byDate : byDate
    })
}

export function GamePage({ identifier }: GamePageProps) {
  const [games, setGames] = useState<Game[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [championships, setChampionships] = useState<Championship[]>([])
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let active = true

    setLoadState('loading')
    setError(null)

    Promise.all([listGames(), listTeams(), listChampionships()])
      .then(([gameList, teamList, championshipList]) => {
        if (!active) return

        setGames(gameList)
        setTeams(teamList)
        setChampionships(championshipList)
        setLoadState('ready')
      })
      .catch((cause) => {
        if (!active) return

        setError(cause instanceof Error ? cause.message : 'Erro ao carregar o jogo.')
        setLoadState('error')
      })

    return () => {
      active = false
    }
  }, [reloadToken])

  const game = useMemo(() => findGame(games, identifier), [games, identifier])
  const summary = useMemo(
    () => (game ? summarizeGame(game.id, teams, championships) : null),
    [game, teams, championships],
  )
  const calendar = useMemo(
    () => buildCalendar(summary?.championships ?? []),
    [summary],
  )
  const nextMatch = calendar.find(({ match }) => match.status !== 'FINISHED') ?? null

  if (loadState === 'loading') {
    return (
      <>
        <div aria-hidden="true" className="border border-line bg-surface px-6 py-8">
          <div className="space-y-3">
            <div className="h-3 w-20 animate-pulse rounded bg-neutral-100" />
            <div className="h-8 w-56 animate-pulse rounded bg-neutral-100" />
            <div className="h-4 w-64 animate-pulse rounded bg-neutral-100" />
          </div>
        </div>
        <p role="status" className="sr-only">
          Carregando o jogo
        </p>
      </>
    )
  }

  if (loadState === 'error') {
    return (
      <LoadError
        message={error ?? 'Erro ao carregar o jogo.'}
        onRetry={() => setReloadToken((current) => current + 1)}
      />
    )
  }

  if (!game || !summary) {
    return (
      <div className="border border-dashed border-line-strong bg-surface px-6 py-16 text-center">
        <h1 className="text-2xl font-bold tracking-[0.02em]">Jogo não encontrado</h1>
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted">
          Este jogo não existe ou foi removido.
        </p>
        <a href={screenHashes.games} className={`${secondaryButtonClass} mt-6`}>
          Ver todos os jogos
        </a>
      </div>
    )
  }

  return (
    <>
      <nav aria-label="Trilha de navegação" className="text-[12px] text-muted">
        <a
          href={screenHashes.games}
          className="underline decoration-line-strong underline-offset-4 transition hover:text-ink hover:decoration-accent"
        >
          Jogos
        </a>
        <span aria-hidden="true" className="mx-1.5">
          /
        </span>
        <span className="uppercase tracking-[0.08em] text-ink">{game.name}</span>
      </nav>

      <article className="mt-4 overflow-hidden border border-line bg-surface">
        <div className="grid gap-8 px-6 py-8 sm:px-9 sm:py-10 lg:grid-cols-[1.35fr_1fr] lg:items-center">
          <div>
            <p className="flex items-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
              <span aria-hidden="true" className="h-px w-8 bg-accent" />
              Jogo
            </p>
            <h1 className="mt-4 text-5xl font-bold leading-[0.92] tracking-[0.005em] sm:text-7xl">
              {game.name}
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
              Premiação, elenco e calendário de {game.name} em um só lugar.
            </p>

            <p className="mt-4 text-[12px] text-muted">{gameSummaryLabels(summary)}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              <a href="#jogadores" className={primaryButtonClass}>
                Ver jogadores
              </a>
              <a href="#calendario" className={secondaryButtonClass}>
                Ver calendário
              </a>
            </div>
          </div>

          <div className="bg-accent px-5 py-5 text-canvas">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-canvas/70">
              Premiação total
            </p>
            <p className="mt-1 font-display text-4xl font-bold leading-none tabular-nums">
              {summary.prizePool > 0 ? formatCurrency(summary.prizePool) : 'A definir'}
            </p>
            <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.1em] text-canvas/70">
              {summary.championships.length}{' '}
              {summary.championships.length === 1 ? 'campeonato' : 'campeonatos'}
            </p>

            <dl className="mt-5 grid grid-cols-3 divide-x divide-canvas/25 border-t border-canvas/25 pt-4 text-center">
              <div>
                <dt className="text-[9px] font-medium uppercase tracking-[0.12em] text-canvas/70">
                  Times
                </dt>
                <dd className="mt-0.5 font-display text-xl font-bold tabular-nums">
                  {summary.teamsCount}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] font-medium uppercase tracking-[0.12em] text-canvas/70">
                  Jogadores
                </dt>
                <dd className="mt-0.5 font-display text-xl font-bold tabular-nums">
                  {summary.players.length}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] font-medium uppercase tracking-[0.12em] text-canvas/70">
                  Partidas
                </dt>
                <dd className="mt-0.5 font-display text-xl font-bold tabular-nums">
                  {summary.matchCount}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {nextMatch && (
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line bg-canvas px-6 py-3 text-[12px] sm:px-9">
            <p className="flex flex-wrap items-center gap-2">
              <span className="font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
                {nextMatch.match.status === 'LIVE' ? 'Ao vivo' : 'Próxima partida'}
              </span>
              <span className="truncate text-muted">{nextMatch.championship.name}</span>
            </p>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted">
              <span className="font-display text-sm font-semibold uppercase tracking-[0.02em] text-ink">
                {nextMatch.match.homeTeam.name} vs {nextMatch.match.awayTeam.name}
              </span>
              <span className="tabular-nums">
                {fullDateFormatter.format(new Date(nextMatch.match.scheduledAt))}
              </span>
            </p>
          </div>
        )}
      </article>

      <section aria-labelledby="game-roster-heading" className="mt-10" id="jogadores">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="game-roster-heading" className="text-xl font-bold tracking-[0.02em]">
              Jogadores
            </h2>
            <p className="mt-0.5 text-[13px] text-muted">
              Quem representa a Infinity em {game.name}.
            </p>
          </div>

          {summary.players.length > 0 && (
            <a
              href={screenHashes.players}
              className="text-[12px] font-medium uppercase tracking-[0.06em] text-muted underline decoration-line-strong underline-offset-4 transition hover:text-ink hover:decoration-accent"
            >
              Ver todos
            </a>
          )}
        </div>

        {summary.players.length === 0 ? (
          <p className="mt-4 border border-dashed border-line-strong bg-surface px-6 py-10 text-center text-sm text-muted">
            Nenhum jogador vinculado a este jogo.
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {summary.players.map((player) => (
              <li key={player.id}>
                <RosterCard player={player} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="game-calendar-heading" className="mt-10" id="calendario">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="game-calendar-heading" className="text-xl font-bold tracking-[0.02em]">
              Calendário
            </h2>
            <p className="mt-0.5 text-[13px] text-muted">
              Próximas partidas e resultados dos campeonatos de {game.name}.
            </p>
          </div>

          {calendar.length > 0 && (
            <span className="text-[11px] tabular-nums text-muted">
              {calendar.length} {calendar.length === 1 ? 'partida' : 'partidas'}
            </span>
          )}
        </div>

        {calendar.length === 0 ? (
          <p className="mt-4 border border-dashed border-line-strong bg-surface px-6 py-10 text-center text-sm text-muted">
            Nenhuma partida registrada. Quando os campeonatos deste jogo tiverem partidas, o
            calendário aparece aqui.
          </p>
        ) : (
          <ol className="mt-4 divide-y divide-line overflow-hidden border border-line bg-surface">
            {calendar.map(({ championship, match }) => {
              const date = new Date(match.scheduledAt)

              return (
                <li key={match.id} className="flex gap-4 px-4 py-4 sm:px-5">
                  <div className="flex w-12 shrink-0 flex-col items-center border-r border-line pr-3 text-center">
                    <span className="font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-accent">
                      {monthFormatter.format(date).replace('.', '')}
                    </span>
                    <span className="font-display text-2xl font-bold leading-tight tabular-nums">
                      {dayFormatter.format(date)}
                    </span>
                    <span className="text-[11px] tabular-nums text-muted">
                      {timeFormatter.format(date)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="max-w-full truncate font-display text-[12px] font-semibold uppercase tracking-[0.04em] text-muted">
                        {championship.name}
                      </span>
                      <StatusBadge status={match.status} />
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
                      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                        <TeamSide team={match.homeTeam} />
                        <span className="text-[10px] uppercase tracking-[0.08em] text-muted">
                          vs
                        </span>
                        <TeamSide team={match.awayTeam} />
                      </div>

                      {match.status !== 'SCHEDULED' && (
                        <span className="shrink-0 font-display text-lg font-bold tabular-nums">
                          {match.homeScore ?? 0}
                          <span className="mx-1 text-muted">–</span>
                          {match.awayScore ?? 0}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </section>

      <section aria-labelledby="game-prizes-heading" className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="game-prizes-heading" className="text-xl font-bold tracking-[0.02em]">
              Campeonatos e premiações
            </h2>
            <p className="mt-0.5 text-[13px] text-muted">
              Torneios de {game.name} e quanto está em jogo.
            </p>
          </div>
        </div>

        {summary.championships.length === 0 ? (
          <p className="mt-4 border border-dashed border-line-strong bg-surface px-6 py-10 text-center text-sm text-muted">
            Nenhum campeonato cadastrado para este jogo.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line overflow-hidden border border-line bg-surface">
            {summary.championships.map((championship) => {
              const period = championship.endDate
                ? `${formatDate(championship.startDate)} – ${formatDate(championship.endDate)}`
                : `A partir de ${formatDate(championship.startDate)}`

              return (
                <li
                  key={championship.id}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-semibold uppercase tracking-[0.02em]">
                      {championship.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted">
                      {period} · {championship.matches.length}{' '}
                      {championship.matches.length === 1 ? 'partida' : 'partidas'}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-muted">
                      Premiação
                    </p>
                    <p className="font-display text-lg font-bold tabular-nums text-accent">
                      {championship.prizePool ? formatCurrency(championship.prizePool) : 'A definir'}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <nav aria-label="Outros jogos" className="mt-10">
        <a href={screenHashes.games} className={secondaryButtonClass}>
          Ver todos os jogos
        </a>
      </nav>
    </>
  )
}
