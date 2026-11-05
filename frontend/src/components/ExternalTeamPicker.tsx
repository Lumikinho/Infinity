import { useState } from 'react'
import type { KeyboardEvent } from 'react'

import { Spinner } from './Spinner'
import { searchExternalTeams } from '../lib/api'
import type { ExternalTeamSuggestion } from '../lib/api'
import { cn } from '../lib/format'
import { fieldClass, secondaryButtonClass } from '../lib/styles'

type SearchState = 'idle' | 'loading' | 'ready'

interface ExternalTeamPickerProps {
  gameId: string
  value: string
  onChange: (name: string) => void
}

export function ExternalTeamPicker({ gameId, value, onChange }: ExternalTeamPickerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ExternalTeamSuggestion[]>([])
  const [state, setState] = useState<SearchState>('idle')
  const [error, setError] = useState<string | null>(null)

  const term = query.trim()
  const loading = state === 'loading'

  async function handleSearch() {
    if (term.length < 2 || loading) return

    setState('loading')
    setError(null)

    try {
      const data = await searchExternalTeams(gameId, term)

      setResults(data.teams ?? [])
      setState('ready')

      if (data.supported === false) {
        setError('Busca automática indisponível para este jogo. Digite o nome e use o time externo.')
      }
    } catch (cause) {
      setResults([])
      setState('idle')
      setError(cause instanceof Error ? cause.message : 'Não foi possível buscar times agora.')
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return

    event.preventDefault()
    void handleSearch()
  }

  function choose(name: string) {
    const trimmed = name.trim()

    if (!trimmed) return

    onChange(trimmed)
    setQuery('')
    setResults([])
    setState('idle')
    setError(null)
  }

  if (value) {
    return (
      <div className="mt-2 flex items-center justify-between gap-3 rounded-md border border-line bg-neutral-50 px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium">{value}</p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
            Time externo
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            onChange('')
            setQuery(value)
          }}
          className="shrink-0 text-[12px] font-medium text-ink underline decoration-line-strong underline-offset-4 transition hover:decoration-accent"
        >
          Trocar
        </button>
      </div>
    )
  }

  return (
    <div className="mt-2">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setState('idle')
          }}
          onKeyDown={handleKeyDown}
          placeholder="Buscar time (ex.: FURIA)"
          maxLength={60}
          aria-label="Buscar time externo"
          className={fieldClass}
        />

        <button
          type="button"
          onClick={() => void handleSearch()}
          disabled={term.length < 2 || loading}
          className={cn(secondaryButtonClass, 'h-11 shrink-0 px-3')}
        >
          {loading ? <Spinner /> : 'Buscar'}
        </button>
      </div>

      {state === 'ready' && results.length > 0 && (
        <ul className="mt-2 max-h-52 overflow-y-auto rounded-md border border-line">
          {results.map((item) => (
            <li key={`${item.name}-${item.url ?? ''}`} className="border-b border-line last:border-0">
              <button
                type="button"
                onClick={() => choose(item.name)}
                className="flex min-h-11 w-full items-center justify-between gap-3 px-3 py-2 text-left transition hover:bg-neutral-100"
              >
                <span className="min-w-0 truncate text-[13px]">{item.name}</span>
                <span className="shrink-0 text-[10px] uppercase tracking-[0.08em] text-muted">
                  selecionar
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {state === 'ready' && results.length === 0 && !error && (
        <p className="mt-2 text-[11px] text-muted">Nenhum time encontrado para essa busca.</p>
      )}

      {error && <p className="mt-2 text-[11px] leading-relaxed text-muted">{error}</p>}

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => choose(term)}
          disabled={term.length < 2}
          className="text-[11px] font-medium text-ink underline decoration-line-strong underline-offset-4 transition hover:decoration-accent disabled:opacity-50"
        >
          Usar “{term || 'nome do time'}” como time externo
        </button>

        <a
          href="https://liquipedia.net"
          target="_blank"
          rel="noreferrer"
          className="text-[10px] text-muted underline decoration-neutral-300 underline-offset-4 transition hover:text-ink"
        >
          Busca via Liquipedia
        </a>
      </div>
    </div>
  )
}
