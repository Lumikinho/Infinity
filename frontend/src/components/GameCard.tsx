import { gameHref } from '../lib/routes'
import type { Game } from '../types'

interface GameCardProps {
  game: Game
}

function bannerTone(name: string) {
  const value = name.toLowerCase()
  if (value.includes('brawl')) return 'game-banner-brawl'
  if (value.includes('counter') || value.includes('cs')) return 'game-banner-counter'
  if (value.includes('valorant')) return 'game-banner-valorant'
  return 'game-banner-default'
}

export function GameCard({ game }: GameCardProps) {
  return (
    <a
      href={gameHref(game.id)}
      aria-label={`Abrir ${game.name}`}
      className="group block overflow-hidden border border-line bg-surface transition hover:border-white/60"
    >
      <div className={`game-banner ${bannerTone(game.name)}`}>
        <span className="game-banner-name font-display text-3xl font-bold uppercase leading-none tracking-[-0.025em] sm:text-4xl">
          {game.name}
        </span>
      </div>
    </a>
  )
}
