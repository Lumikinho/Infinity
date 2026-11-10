import { useCallback, useEffect, useMemo, useState } from 'react'

import { ChampionshipBoard } from '../components/ChampionshipBoard'
import { LoadError } from '../components/LoadError'
import { PlayerCard } from '../components/PlayerCard'
import { TeamLogo } from '../components/TeamLogo'
import { formatCurrency } from '../lib/format'
import {
  imageUrl,
  listChampionships,
  listPlayers,
  listTeams,
} from '../lib/localData'
import { playerHref, screenHashes } from '../lib/routes'
import { primaryButtonClass, secondaryButtonClass } from '../lib/styles'
import type { Championship, Player, Team } from '../types'

type LoadState = 'loading' | 'ready' | 'error'

const GAME_ID = 'brawl-stars'

function TeamCard({ team }: { team: Team }) {
  return (
    <article className="border border-line bg-surface p-5">
      <div className="flex items-center gap-3">
        <TeamLogo name={team.name} src={imageUrl(team.logo)} size="lg" />

        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold tracking-[0.02em]">{team.name}</h3>
          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
            {team.tag} · {team.players.length}{' '}
            {team.players.length === 1 ? 'jogador' : 'jogadores'}
          </p>
        </div>
      </div>

      {team.players.length === 0 ? (
        <p className="mt-4 border border-dashed border-line-strong px-3 py-4 text-center text-[12px] text-muted">
          Elenco ainda não definido.
        </p>
      ) : (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {team.players.map((player) => (
            <li key={player.id}>
              <a
                href={playerHref(player.id)}
                className="inline-flex min-h-8 items-center rounded border border-line bg-canvas px-2 py-1 text-[12px] font-medium transition hover:border-white/50 hover:text-accent"
              >
                {player.nickname}
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

export function BrawlStarsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [championships, setChampionships] = useState<Championship[]>([])
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const load = useCallback(async () => {
    setLoadState('loading')
    setError(null)

    try {
      const [teamList, playerList, championshipList] = await Promise.all([
        listTeams(),
        listPlayers(),
        listChampionships(),
      ])

      setTeams(teamList.filter((team) => team.gameId === GAME_ID))
      setPlayers(playerList)
      setChampionships(
        championshipList.filter((championship) => championship.gameId === GAME_ID),
      )
      setLoadState('ready')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erro ao carregar o Brawl Stars.')
      setLoadState('error')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load, reloadToken])

  const roster = useMemo(
    () => players.filter((player) => player.teams.some((team) => team.game.id === GAME_ID)),
    [players],
  )

  const prizePool = useMemo(
    () =>
      championships.reduce(
        (total, championship) => total + (championship.prizePool ?? 0),
        0,
      ),
    [championships],
  )

  const matchCount = useMemo(
    () =>
      championships.reduce(
        (total, championship) => total + championship.matches.length,
        0,
      ),
    [championships],
  )

  const liveCount = useMemo(
    () =>
      championships.reduce(
        (total, championship) =>
          total + championship.matches.filter((match) => match.status === 'LIVE').length,
        0,
      ),
    [championships],
  )

  if (loadState === 'loading') {
    return (
      <>
        <div aria-hidden="true" className="space-y-4">
          <div className="h-10 w-64 animate-pulse rounded bg-neutral-100" />
          <div className="h-56 animate-pulse border border-line bg-surface" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-40 animate-pulse border border-line bg-surface" />
            <div className="h-40 animate-pulse border border-line bg-surface" />
          </div>
        </div>
        <p role="status" className="sr-only">
          Carregando Brawl Stars
        </p>
      </>
    )
  }

  if (loadState === 'error') {
    return (
      <LoadError
        message={error ?? 'Erro ao carregar o Brawl Stars.'}
        onRetry={() => setReloadToken((current) => current + 1)}
      />
    )
  }

  return (
    <>
      <nav aria-label="Trilha de navegação" className="text-[12px] text-muted">
        <a
          href={screenHashes.home}
          className="underline decoration-line-strong underline-offset-4 transition hover:text-ink hover:decoration-accent"
        >
          Início
        </a>
        <span aria-hidden="true" className="mx-1.5">
          /
        </span>
        <a
          href={screenHashes.games}
          className="underline decoration-line-strong underline-offset-4 transition hover:text-ink hover:decoration-accent"
        >
          Jogos
        </a>
        <span aria-hidden="true" className="mx-1.5">
          /
        </span>
        <span className="uppercase tracking-[0.08em] text-ink">Brawl Stars</span>
      </nav>

      <article className="mt-4 overflow-hidden border border-line bg-surface">
        <div className="grid gap-8 px-6 py-8 sm:px-9 sm:py-10 lg:grid-cols-[1.35fr_1fr] lg:items-center">
          <div>
            <p className="flex items-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
              <span aria-hidden="true" className="h-px w-8 bg-accent" />
              Jogo em destaque
            </p>
            <h1 className="mt-4 text-5xl font-bold leading-[0.92] tracking-[0.005em] sm:text-7xl">
              Brawl Stars
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
              O universo competitivo da Infinity no Brawl Stars: elencos, campeonatos,
              premiações e todas as partidas em um só lugar.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <a href="#elenco" className={primaryButtonClass}>
                Ver elenco
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
              {prizePool > 0 ? formatCurrency(prizePool) : 'A definir'}
            </p>
            <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.1em] text-canvas/70">
              {championships.length}{' '}
              {championships.length === 1 ? 'campeonato' : 'campeonatos'}
            </p>

            <dl className="mt-5 grid grid-cols-2 gap-2 border-t border-canvas/25 pt-4">
              <div>
                <dt className="text-[9px] font-medium uppercase tracking-[0.12em] text-canvas/70">
                  Times
                </dt>
                <dd className="mt-0.5 font-display text-xl font-bold tabular-nums">
                  {teams.length}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] font-medium uppercase tracking-[0.12em] text-canvas/70">
                  Jogadores
                </dt>
                <dd className="mt-0.5 font-display text-xl font-bold tabular-nums">
                  {roster.length}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] font-medium uppercase tracking-[0.12em] text-canvas/70">
                  Partidas
                </dt>
                <dd className="mt-0.5 font-display text-xl font-bold tabular-nums">
                  {matchCount}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] font-medium uppercase tracking-[0.12em] text-canvas/70">
                  Ao vivo
                </dt>
                <dd className="mt-0.5 font-display text-xl font-bold tabular-nums">
                  {liveCount}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </article>

      <section aria-labelledby="brawl-teams-heading" className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="brawl-teams-heading" className="text-xl font-bold tracking-[0.02em]">
              Times
            </h2>
            <p className="mt-0.5 text-[13px] text-muted">
              As equipes da Infinity na modalidade.
            </p>
          </div>

          <span className="text-[11px] tabular-nums text-muted">
            {teams.length} {teams.length === 1 ? 'time' : 'times'}
          </span>
        </div>

        {teams.length === 0 ? (
          <p className="mt-4 border border-dashed border-line-strong bg-surface px-6 py-10 text-center text-sm text-muted">
            Nenhum time de Brawl Stars cadastrado.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="brawl-roster-heading" className="mt-10" id="elenco">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="brawl-roster-heading" className="text-xl font-bold tracking-[0.02em]">
              Elenco
            </h2>
            <p className="mt-0.5 text-[13px] text-muted">
              Quem representa a Infinity no Brawl Stars.
            </p>
          </div>

          {roster.length > 0 && (
            <a
              href={screenHashes.players}
              className="text-[12px] font-medium uppercase tracking-[0.06em] text-muted underline decoration-line-strong underline-offset-4 transition hover:text-ink hover:decoration-accent"
            >
              Ver todos os jogadores
            </a>
          )}
        </div>

        {roster.length === 0 ? (
          <p className="mt-4 border border-dashed border-line-strong bg-surface px-6 py-10 text-center text-sm text-muted">
            Nenhum jogador vinculado ao Brawl Stars.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {roster.map((player) => (
              <PlayerCard key={player.id} player={player} layout="grid" />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="brawl-calendar-heading" className="mt-10" id="calendario">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="brawl-calendar-heading" className="text-xl font-bold tracking-[0.02em]">
              Campeonatos e calendário
            </h2>
            <p className="mt-0.5 text-[13px] text-muted">
              Partidas em andamento, próximas e resultados.
            </p>
          </div>

          <span className="text-[11px] tabular-nums text-muted">
            {matchCount} {matchCount === 1 ? 'partida' : 'partidas'}
          </span>
        </div>

        <div className="mt-4">
          <ChampionshipBoard
            championships={championships}
            emptyTitle="Nenhuma partida de Brawl Stars"
            emptyDescription="Quando houver partidas nos campeonatos desta modalidade, elas aparecem aqui."
          />
        </div>
      </section>

      <nav aria-label="Outras páginas" className="mt-10 flex flex-wrap gap-2">
        <a href={screenHashes.home} className={secondaryButtonClass}>
          Voltar ao início
        </a>
        <a href={screenHashes.games} className={secondaryButtonClass}>
          Ver todos os jogos
        </a>
      </nav>
    </>
  )
}
