import { useEffect, useState } from 'react'

import { TeamLogo } from '../components/TeamLogo'
import { imageUrl, listPlayerChampionships } from '../lib/api'
import { formatDate, formatDateTime } from '../lib/format'
import type { Championship, MatchStatus, User } from '../types'

type LoadState = 'loading' | 'ready' | 'error'

const matchGroups: Array<{ status: MatchStatus; label: string }> = [
  { status: 'LIVE', label: 'Em andamento' },
  { status: 'SCHEDULED', label: 'Próximas' },
  { status: 'FINISHED', label: 'Encerradas' },
]

interface PlayerHomePageProps {
  user: User
}

export function PlayerHomePage({ user }: PlayerHomePageProps) {
  const [championships, setChampionships] = useState<Championship[]>([])
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let active = true

    setLoadState('loading')

    listPlayerChampionships(user.UUID)
      .then((data) => {
        if (!active) return

        setChampionships(data)
        setLoadState('ready')
      })
      .catch(() => {
        if (!active) return

        setLoadState('error')
      })

    return () => {
      active = false
    }
  }, [user.UUID, reloadToken])

  const totalMatches = championships.reduce((total, item) => total + item.matches.length, 0)
  const liveMatches = championships.reduce(
    (total, item) => total + item.matches.filter((match) => match.status === 'LIVE').length,
    0,
  )

  return (
    <>
      <section className="relative isolate overflow-hidden border border-line bg-black px-5 py-6 sm:px-7 sm:py-7">
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(ellipse_at_right,rgba(255,255,255,0.08),transparent_70%)]" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              <span aria-hidden="true" className="h-px w-7 bg-accent" />
              Painel do jogador
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-none tracking-[0.01em] sm:text-5xl">
              {user.name}
            </h1>
            <p className="mt-2 text-sm text-muted">
              Campeonatos e partidas dos times em que você joga.
            </p>
          </div>

          {loadState === 'ready' && (
            <dl className="grid w-full grid-cols-3 gap-2 sm:w-auto sm:min-w-[21rem]">
              {[
                { label: 'Campeonatos', value: championships.length },
                { label: 'Partidas', value: totalMatches },
                { label: 'Ao vivo', value: liveMatches },
              ].map((stat) => (
                <div key={stat.label} className="border border-white/15 bg-white/[0.04] px-3 py-2.5">
                  <dt className="text-[9px] font-medium uppercase tracking-[0.12em] text-muted">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 font-display text-2xl font-bold tabular-nums text-ink">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      <section aria-labelledby="player-championships-heading" className="mt-8">
        <div className="flex items-baseline justify-between gap-3">
          <h2
            id="player-championships-heading"
            className="font-display text-xl font-bold uppercase tracking-[0.02em]"
          >
            Seus campeonatos
          </h2>

          {loadState === 'ready' && championships.length > 0 && (
            <span className="text-[11px] text-muted">
              {championships.length}{' '}
              {championships.length === 1 ? 'campeonato' : 'campeonatos'}
            </span>
          )}
        </div>

        {loadState === 'loading' && (
          <div aria-hidden="true" className="mt-3 space-y-3">
            {[0, 1].map((item) => (
              <div key={item} className="rounded-lg border border-line bg-surface px-4 py-3.5">
                <div className="h-3.5 w-48 animate-pulse rounded bg-neutral-100" />
                <div className="mt-2 h-2.5 w-32 animate-pulse rounded bg-neutral-100" />
                <div className="mt-4 h-10 animate-pulse rounded-md bg-neutral-100" />
              </div>
            ))}
          </div>
        )}

        {loadState === 'error' && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3">
            <p className="text-[13px] text-muted">Não foi possível carregar seus campeonatos.</p>
            <button
              type="button"
              onClick={() => setReloadToken((current) => current + 1)}
              className="text-[13px] font-medium text-ink underline decoration-line-strong underline-offset-4 transition hover:decoration-accent"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {loadState === 'ready' && championships.length === 0 && (
          <div className="mt-3 rounded-lg border border-dashed border-neutral-300 bg-surface px-6 py-12 text-center">
            <h3 className="text-base font-semibold">Nenhum campeonato por enquanto</h3>
            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted">
              Quando o seu time entrar em um campeonato, ele aparece aqui com as partidas
              previstas.
            </p>
          </div>
        )}

        {loadState === 'ready' && championships.length > 0 && (
          <div className="mt-3 space-y-3">
            {championships.map((championship) => {
              const period = championship.endDate
                ? `${formatDate(championship.startDate)} – ${formatDate(championship.endDate)}`
                : `A partir de ${formatDate(championship.startDate)}`

              return (
                <article
                  key={championship.id}
                  aria-labelledby={`player-championship-${championship.id}`}
                  className="overflow-hidden rounded-lg border border-line bg-surface"
                >
                  <header className="border-b border-line px-4 py-3.5">
                    <h3
                      id={`player-championship-${championship.id}`}
                      className="truncate text-base font-semibold tracking-tight"
                    >
                      {championship.name}
                    </h3>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
                      <span className="inline-block max-w-40 truncate rounded border border-line bg-neutral-50 px-1.5 py-0.5">
                        {championship.game.name}
                      </span>
                      <span className="tabular-nums">{period}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {championship.matches.length}{' '}
                        {championship.matches.length === 1
                          ? 'partida do seu time'
                          : 'partidas do seu time'}
                      </span>
                    </p>
                  </header>

                  <div className="space-y-4 px-4 py-3">
                    {matchGroups.map((group) => {
                      const matches = championship.matches.filter(
                        (match) => match.status === group.status,
                      )

                      if (matches.length === 0) return null

                      return (
                        <div key={group.status}>
                          <h4 className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
                            {group.label}
                            {group.status === 'LIVE' && (
                              <span className="size-1.5 rounded-full bg-accent" />
                            )}
                            <span className="font-normal normal-case tracking-normal">
                              ({matches.length})
                            </span>
                          </h4>

                          <ul className="mt-2 divide-y divide-line rounded-md border border-line">
                            {matches.map((match) => (
                              <li
                                key={match.id}
                                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 py-2.5"
                              >
                                <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                                  <span className="flex min-w-0 items-center gap-1.5">
                                    <TeamLogo
                                      name={match.homeTeam.name}
                                      src={imageUrl(match.homeTeam.logo)}
                                      size="sm"
                                    />
                                    <span className="truncate text-[13px] font-medium">
                                      {match.homeTeam.name}
                                    </span>
                                  </span>

                                  <span className="text-[10px] uppercase tracking-[0.08em] text-muted">
                                    vs
                                  </span>

                                  <span className="flex min-w-0 items-center gap-1.5">
                                    <TeamLogo
                                      name={match.awayTeam.name}
                                      src={imageUrl(match.awayTeam.logo)}
                                      size="sm"
                                    />
                                    <span className="truncate text-[13px] font-medium">
                                      {match.awayTeam.name}
                                    </span>
                                  </span>
                                </div>

                                <div className="flex items-center gap-3">
                                  {match.status !== 'SCHEDULED' && (
                                    <span className="tabular-nums text-sm font-medium">
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
                </article>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
