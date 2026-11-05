import { Avatar } from './Avatar'
import { PlayerPortrait } from './PlayerPortrait'
import { TeamLogo } from './TeamLogo'
import { imageUrl } from '../lib/api'
import { cn } from '../lib/format'
import { playerHref } from '../lib/routes'
import type { Player } from '../types'

interface PlayerCardProps {
  player: Player
  layout?: 'row' | 'grid'
}

function PlayerTeams({ player, className }: { player: Player; className?: string }) {
  if (player.teams.length === 0) {
    return <p className={cn('text-[11px] text-muted', className)}>Sem time</p>
  }

  return (
    <div className={cn('space-y-2', className)}>
      {player.teams.map((team) => (
        <div key={team.id} className="flex min-w-0 items-center gap-2">
          <TeamLogo name={team.name} src={imageUrl(team.logo)} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-display text-[13px] font-semibold uppercase tracking-[0.02em]">
              {team.name}
            </p>
            <p className="truncate text-[10px] uppercase tracking-[0.12em] text-muted">
              {team.game.name}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function PlayerGridCard({ player }: { player: Player }) {
  return (
    <a
      href={playerHref(player.id)}
      className="group flex h-full flex-col overflow-hidden border border-line bg-surface transition hover:border-accent/60 hover:bg-white/[0.02]"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden border-b border-line bg-neutral-100">
        <PlayerPortrait
          name={player.nickname}
          src={imageUrl(player.photo)}
          className="transition duration-300 group-hover:scale-[1.02]"
          initialsClassName="text-4xl"
        />

        <span className="absolute right-2 top-2 max-w-[calc(100%-1rem)] truncate border border-line bg-canvas/90 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-muted">
          {player.country}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3.5">
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold uppercase leading-tight tracking-[0.02em] transition group-hover:text-accent">
            {player.nickname}
          </p>
          <p className="truncate text-[12px] text-muted">{player.realName}</p>
        </div>

        <PlayerTeams player={player} className="mt-auto" />
      </div>
    </a>
  )
}

export function PlayerCard({ player, layout = 'row' }: PlayerCardProps) {
  if (layout === 'grid') return <PlayerGridCard player={player} />

  const teams = player.teams.map((team) => team.tag).join(' · ')

  return (
    <a
      href={playerHref(player.id)}
      className="group flex items-center gap-3 border border-line bg-surface p-4 transition hover:border-accent/60 hover:bg-white/[0.02]"
    >
      <Avatar name={player.nickname} src={imageUrl(player.photo)} size="lg" />

      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-lg font-semibold uppercase leading-tight tracking-[0.02em] transition group-hover:text-accent">
          {player.nickname}
        </p>
        <p className="truncate text-[13px] text-muted">{player.realName}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-muted">
          <span>{player.country}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{teams || 'Sem time'}</span>
        </p>
      </div>
    </a>
  )
}
