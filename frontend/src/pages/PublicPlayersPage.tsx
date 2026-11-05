import { useEffect, useMemo, useState } from 'react'

import { LoadError } from '../components/LoadError'
import { PlayerCard } from '../components/PlayerCard'
import { listPlayers } from '../lib/api'
import { fieldClass } from '../lib/styles'
import type { Player } from '../types'

type LoadState = 'loading' | 'ready' | 'error'

function matchesQuery(player: Player, query: string) {
  const term = query.trim().toLowerCase()

  if (!term) return true

  const teams = player.teams.flatMap((team) => [team.name, team.tag, team.game.name])

  return [player.nickname, player.realName, player.country, ...teams]
    .join(' ')
    .toLowerCase()
    .includes(term)
}

export function PublicPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let active = true

    setLoadState('loading')
    setError(null)

    listPlayers()
      .then((data) => {
        if (!active) return

        setPlayers(data)
        setLoadState('ready')
      })
      .catch((cause) => {
        if (!active) return

        setError(cause instanceof Error ? cause.message : 'Erro ao carregar os jogadores.')
        setLoadState('error')
      })

    return () => {
      active = false
    }
  }, [reloadToken])

  const filtered = useMemo(
    () => players.filter((player) => matchesQuery(player, query)),
    [players, query],
  )

  return (
    <>
      <header>
        <p className="flex items-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
          <span aria-hidden="true" className="h-px w-8 bg-accent" />
          Elenco
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-[0.95] tracking-[0.005em] sm:text-5xl">
          Jogadores
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
          Todos os jogadores da Infinity, com país, times e perfil completo.
        </p>
      </header>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div className="w-full max-w-sm">
          <label htmlFor="player-search" className="sr-only">
            Buscar jogadores
          </label>
          <input
            id="player-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome, país ou time"
            className={fieldClass}
          />
        </div>

        {loadState === 'ready' && (
          <p className="text-[12px] tabular-nums text-muted">
            {filtered.length}{' '}
            {filtered.length === 1 ? 'jogador encontrado' : 'jogadores encontrados'}
          </p>
        )}
      </div>

      {loadState === 'loading' && (
        <>
          <div
            aria-hidden="true"
            className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4"
          >
            {[0, 1, 2, 3, 4, 5, 6, 7].map((item) => (
              <div
                key={item}
                className="aspect-[4/5] animate-pulse border border-line bg-surface"
              />
            ))}
          </div>
          <p role="status" className="sr-only">
            Carregando jogadores
          </p>
        </>
      )}

      {loadState === 'error' && (
        <LoadError
          message={error ?? 'Erro ao carregar os jogadores.'}
          onRetry={() => setReloadToken((current) => current + 1)}
        />
      )}

      {loadState === 'ready' && filtered.length === 0 && (
        <div className="mt-5 border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
          <h2 className="text-xl font-bold tracking-[0.02em]">
            {players.length === 0 ? 'Nenhum jogador cadastrado' : 'Nenhum jogador encontrado'}
          </h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted">
            {players.length === 0
              ? 'Assim que os jogadores forem cadastrados, eles aparecem aqui.'
              : 'Tente outro nome, país ou time.'}
          </p>
        </div>
      )}

      {loadState === 'ready' && filtered.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((player) => (
            <PlayerCard key={player.id} player={player} layout="grid" />
          ))}
        </div>
      )}
    </>
  )
}
