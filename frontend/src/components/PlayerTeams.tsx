import { useId } from 'react'

import { TeamLogo } from './TeamLogo'
import { imageUrl } from '../lib/localData'
import type { PlayerTeam } from '../types'

export type TeamsState = 'loading' | 'ready' | 'error'

interface PlayerTeamsProps {
  teams: PlayerTeam[]
  state: TeamsState
  onRetry: () => void
  className?: string
}

export function PlayerTeams({ teams, state, onRetry, className }: PlayerTeamsProps) {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId} className={className}>
      <h2
        id={headingId}
        className="px-2 text-[10px] font-medium uppercase tracking-[0.12em] text-muted"
      >
        {teams.length > 1 ? 'Seus times' : 'Seu time'}
      </h2>

      {state === 'loading' && (
        <div aria-hidden="true" className="mt-2 flex items-center gap-2.5 px-2 py-1.5">
          <div className="size-8 shrink-0 animate-pulse rounded-md bg-neutral-100" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 w-28 animate-pulse rounded bg-neutral-100" />
            <div className="h-2.5 w-16 animate-pulse rounded bg-neutral-100" />
          </div>
        </div>
      )}

      {state === 'error' && (
        <div className="mt-2 px-2 py-1.5">
          <p className="text-[11px] text-muted">Não foi possível carregar seu time.</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-1 text-[11px] font-medium text-ink underline decoration-line-strong underline-offset-4 transition hover:decoration-accent"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {state === 'ready' && teams.length === 0 && (
        <p className="mt-2 px-2 py-1.5 text-[11px] text-muted">
          Você ainda não está em um time.
        </p>
      )}

      {state === 'ready' && teams.length > 0 && (
        <ul className="mt-2 space-y-1">
          {teams.map((team) => (
            <li
              key={team.id}
              className="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition hover:bg-neutral-100"
            >
              <TeamLogo name={team.name} src={imageUrl(team.logo)} size="sm" />

              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium">{team.name}</span>
                <span className="mt-0.5 block truncate text-[11px] text-muted">
                  <span className="font-medium uppercase tracking-[0.08em] text-ink">
                    {team.tag}
                  </span>
                  <span className="mx-1" aria-hidden="true">
                    ·
                  </span>
                  {team.game.name}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
