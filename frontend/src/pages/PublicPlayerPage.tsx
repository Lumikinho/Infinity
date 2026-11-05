import { useEffect, useState } from 'react'

import { Avatar } from '../components/Avatar'
import { ChampionshipBoard } from '../components/ChampionshipBoard'
import { LoadError } from '../components/LoadError'
import { TeamLogo } from '../components/TeamLogo'
import { ApiError, getPlayer, imageUrl, listPlayerChampionships } from '../lib/api'
import { formatDate } from '../lib/format'
import { gameHref, screenHashes } from '../lib/routes'
import { secondaryButtonClass } from '../lib/styles'
import type { Championship, Player } from '../types'

type LoadState = 'loading' | 'ready' | 'error'

interface PublicPlayerPageProps {
  playerId: string
}

export function PublicPlayerPage({ playerId }: PublicPlayerPageProps) {
  const [player, setPlayer] = useState<Player | null>(null)
  const [championships, setChampionships] = useState<Championship[]>([])
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let active = true

    setLoadState('loading')
    setError(null)
    setNotFound(false)

    async function load() {
      try {
        const playerData = await getPlayer(playerId)
        const championshipList = await listPlayerChampionships(playerData.user.UUID)

        if (!active) return

        setPlayer(playerData)
        setChampionships(championshipList)
        setLoadState('ready')
      } catch (cause) {
        if (!active) return

        setNotFound(cause instanceof ApiError && cause.status === 404)
        setError(cause instanceof Error ? cause.message : 'Erro ao carregar o jogador.')
        setLoadState('error')
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [playerId, reloadToken])

  if (loadState === 'loading') {
    return (
      <>
        <div aria-hidden="true" className="border border-line bg-surface px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="size-16 animate-pulse rounded-full bg-neutral-100" />
            <div className="space-y-2">
              <div className="h-3 w-24 animate-pulse rounded bg-neutral-100" />
              <div className="h-6 w-48 animate-pulse rounded bg-neutral-100" />
            </div>
          </div>
        </div>
        <p role="status" className="sr-only">
          Carregando jogador
        </p>
      </>
    )
  }

  if (loadState === 'error' || !player) {
    if (notFound) {
      return (
        <div className="border border-dashed border-line-strong bg-surface px-6 py-16 text-center">
          <h1 className="text-2xl font-bold tracking-[0.02em]">Jogador não encontrado</h1>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted">
            Este jogador não existe ou foi removido.
          </p>
          <a href={screenHashes.players} className={`${secondaryButtonClass} mt-6`}>
            Ver todos os jogadores
          </a>
        </div>
      )
    }

    return (
      <LoadError
        message={error ?? 'Erro ao carregar o jogador.'}
        onRetry={() => setReloadToken((current) => current + 1)}
      />
    )
  }

  const matchCount = championships.reduce(
    (total, championship) => total + championship.matches.length,
    0,
  )

  return (
    <>
      <nav aria-label="Trilha de navegação" className="text-[12px] text-muted">
        <a
          href={screenHashes.players}
          className="underline decoration-line-strong underline-offset-4 transition hover:text-ink hover:decoration-accent"
        >
          Jogadores
        </a>
        <span aria-hidden="true" className="mx-1.5">
          /
        </span>
        <span className="uppercase tracking-[0.08em] text-ink">{player.nickname}</span>
      </nav>

      <article className="mt-4 overflow-hidden border border-line bg-surface">
        <div className="flex flex-wrap items-start gap-4 px-6 py-6 sm:px-8 sm:py-8">
          <Avatar name={player.nickname} src={imageUrl(player.photo)} size="lg" />

          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
              <span aria-hidden="true" className="h-px w-6 bg-accent" />
              {player.country}
            </p>
            <h1 className="mt-2 text-4xl font-bold leading-[0.95] tracking-[0.005em] sm:text-5xl">
              {player.nickname}
            </h1>
            <p className="mt-2 text-sm text-muted">{player.realName}</p>
            <p className="mt-1 text-[11px] text-muted">
              No Infinity desde {formatDate(player.createdAt)}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-2 text-center">
            <div className="border border-line bg-canvas px-4 py-2.5">
              <dt className="text-[9px] font-medium uppercase tracking-[0.14em] text-muted">
                Times
              </dt>
              <dd className="mt-0.5 font-display text-xl font-bold tabular-nums">
                {player.teams.length}
              </dd>
            </div>
            <div className="border border-line bg-canvas px-4 py-2.5">
              <dt className="text-[9px] font-medium uppercase tracking-[0.14em] text-muted">
                Partidas
              </dt>
              <dd className="mt-0.5 font-display text-xl font-bold tabular-nums">{matchCount}</dd>
            </div>
          </dl>
        </div>
      </article>

      <section aria-labelledby="player-teams-heading" className="mt-10">
        <h2 id="player-teams-heading" className="text-xl font-bold tracking-[0.02em]">
          Times
        </h2>

        {player.teams.length === 0 ? (
          <p className="mt-3 border border-dashed border-line-strong bg-surface px-6 py-10 text-center text-sm text-muted">
            Este jogador ainda não está em nenhum time.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {player.teams.map((team) => (
              <li key={team.id}>
                <a
                  href={gameHref(team.game.id)}
                  className="group flex items-center gap-3 border border-line bg-surface p-4 transition hover:border-accent/60 hover:bg-white/[0.02]"
                >
                  <TeamLogo name={team.name} src={imageUrl(team.logo)} />

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base font-semibold uppercase tracking-[0.02em] transition group-hover:text-accent">
                      {team.name}
                    </p>
                    <p className="truncate text-[12px] text-muted">
                      {team.tag} · {team.game.name}
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="player-championships-heading" className="mt-10">
        <h2 id="player-championships-heading" className="text-xl font-bold tracking-[0.02em]">
          Campeonatos e partidas
        </h2>
        <p className="mt-0.5 text-[13px] text-muted">Partidas dos times deste jogador.</p>

        <div className="mt-4">
          <ChampionshipBoard
            championships={championships}
            emptyTitle="Nenhum campeonato registrado"
            emptyDescription="Quando os times deste jogador entrarem em um campeonato, as partidas aparecem aqui."
          />
        </div>
      </section>
    </>
  )
}
