import { useEffect, useMemo, useState } from 'react'

import { GameCard } from '../components/GameCard'
import { LoadError } from '../components/LoadError'
import { listGames } from '../lib/localData'
import { fieldClass } from '../lib/styles'
import type { Game } from '../types'

type LoadState = 'loading' | 'ready' | 'error'

export function PublicGamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let active = true

    setLoadState('loading')
    setError(null)

    listGames()
      .then((gameList) => {
        if (!active) return

        const sorted = [...gameList].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

        setGames(sorted)
        setLoadState('ready')
      })
      .catch((cause) => {
        if (!active) return

        setError(cause instanceof Error ? cause.message : 'Erro ao carregar os jogos.')
        setLoadState('error')
      })

    return () => {
      active = false
    }
  }, [reloadToken])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()

    if (!term) return games

    return games.filter((game) => game.name.toLowerCase().includes(term))
  }, [games, query])

  return (
    <>
      <header>
        <p className="flex items-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
          <span aria-hidden="true" className="h-px w-8 bg-accent" />
          Catálogo competitivo
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-[0.95] tracking-[0.005em] sm:text-5xl">
          Jogos
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
          Escolha um jogo para ver a premiação, os jogadores e o calendário de partidas.
        </p>
      </header>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div className="w-full max-w-sm">
          <label htmlFor="game-search" className="sr-only">
            Buscar jogos
          </label>
          <input
            id="game-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar jogo"
            className={fieldClass}
          />
        </div>

        {loadState === 'ready' && (
          <p className="text-[12px] tabular-nums text-muted">
            {filtered.length} {filtered.length === 1 ? 'jogo encontrado' : 'jogos encontrados'}
          </p>
        )}
      </div>

      {loadState === 'loading' && (
        <>
          <div aria-hidden="true" className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="aspect-[2.2] min-h-36 animate-pulse border border-line bg-surface" />
            ))}
          </div>
          <p role="status" className="sr-only">
            Carregando jogos
          </p>
        </>
      )}

      {loadState === 'error' && (
        <LoadError
          message={error ?? 'Erro ao carregar os jogos.'}
          onRetry={() => setReloadToken((current) => current + 1)}
        />
      )}

      {loadState === 'ready' && filtered.length === 0 && (
        <div className="mt-5 border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
          <h2 className="text-xl font-bold tracking-[0.02em]">
            {games.length === 0 ? 'Nenhum jogo cadastrado' : 'Nenhum jogo encontrado'}
          </h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted">
            {games.length === 0
              ? 'Assim que os jogos forem cadastrados, eles aparecem aqui.'
              : 'Tente outro nome de jogo.'}
          </p>
        </div>
      )}

      {loadState === 'ready' && filtered.length > 0 && (
        <ul className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((game) => (
            <li key={game.id}>
              <GameCard game={game} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
