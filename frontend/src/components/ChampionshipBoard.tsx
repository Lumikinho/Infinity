import { TeamLogo } from './TeamLogo'
import { imageUrl } from '../lib/api'
import { cn, formatCurrency, formatDate, formatDateTime } from '../lib/format'
import type { Championship, ChampionshipMatch, MatchStatus, MatchTeam } from '../types'

const matchGroups: Array<{ status: MatchStatus; label: string }> = [
  { status: 'LIVE', label: 'Em andamento' },
  { status: 'SCHEDULED', label: 'Próximas' },
  { status: 'FINISHED', label: 'Encerradas' },
]

interface ChampionshipBoardProps {
  championships: Championship[]
  teamId?: string
  emptyTitle?: string
  emptyDescription?: string
}

function sortMatches(matches: ChampionshipMatch[]) {
  return [...matches].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
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
        <span className="shrink-0 rounded border border-line bg-neutral-50 px-1 text-[10px] uppercase tracking-[0.08em] text-muted">
          externo
        </span>
      )}
    </span>
  )
}

function matchCountLabel(count: number) {
  return `${count} ${count === 1 ? 'partida' : 'partidas'}`
}

export function ChampionshipBoard({
  championships,
  teamId,
  emptyTitle = 'Nenhuma partida registrada',
  emptyDescription = 'Quando houver partidas neste campeonato, elas aparecem aqui.',
}: ChampionshipBoardProps) {
  const entries = championships
    .map((championship) => ({
      championship,
      matches: sortMatches(
        teamId
          ? championship.matches.filter(
              (match) => match.homeTeam.id === teamId || match.awayTeam.id === teamId,
            )
          : championship.matches,
      ),
    }))
    .filter((entry) => entry.matches.length > 0)

  if (entries.length === 0) {
    return (
      <div className="border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
        <h2 className="text-xl font-bold tracking-[0.02em]">{emptyTitle}</h2>
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted">
          {emptyDescription}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {entries.map(({ championship, matches }) => {
        const period = championship.endDate
          ? `${formatDate(championship.startDate)} – ${formatDate(championship.endDate)}`
          : `A partir de ${formatDate(championship.startDate)}`

        return (
          <section
            key={championship.id}
            aria-labelledby={`championship-${championship.id}`}
            className="overflow-hidden border border-line bg-surface"
          >
            <header className="border-b border-line px-4 py-3.5">
              <h3
                id={`championship-${championship.id}`}
                className="truncate text-lg font-bold tracking-[0.02em]"
              >
                {championship.name}
              </h3>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
                <span className="inline-block max-w-40 truncate rounded border border-line bg-neutral-50 px-1.5 py-0.5">
                  {championship.game.name}
                </span>
                <span className="tabular-nums">{period}</span>
                <span aria-hidden="true">·</span>
                <span>{matchCountLabel(matches.length)}</span>
                {championship.prizePool ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-accent">
                      {formatCurrency(championship.prizePool)} em premiação
                    </span>
                  </>
                ) : null}
              </p>
            </header>

            <div className="space-y-4 px-4 py-3">
              {matchGroups.map((group) => {
                const groupMatches = matches.filter((match) => match.status === group.status)

                if (groupMatches.length === 0) return null

                return (
                  <div key={group.status}>
                    <h4 className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
                      {group.label}
                      {group.status === 'LIVE' && (
                        <span className="size-1.5 rounded-full bg-accent" />
                      )}
                      <span className="font-normal normal-case tracking-normal">
                        ({groupMatches.length})
                      </span>
                    </h4>

                    <ul className="mt-2 divide-y divide-line rounded-md border border-line">
                      {groupMatches.map((match) => (
                        <li
                          key={match.id}
                          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 py-2.5"
                        >
                          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                            <TeamSide team={match.homeTeam} />

                            <span className="text-[10px] uppercase tracking-[0.08em] text-muted">
                              vs
                            </span>

                            <TeamSide team={match.awayTeam} />
                          </div>

                          <div className="flex items-center gap-3">
                            {match.status !== 'SCHEDULED' && (
                              <span
                                className={cn(
                                  'font-display text-base font-bold tabular-nums',
                                  match.status === 'LIVE' && 'text-accent',
                                )}
                              >
                                {match.homeScore ?? 0}
                                <span className="mx-1 text-muted">–</span>
                                {match.awayScore ?? 0}
                              </span>
                            )}

                            <span className="whitespace-nowrap text-[11px] tabular-nums text-muted">
                              {formatDateTime(match.scheduledAt)}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
