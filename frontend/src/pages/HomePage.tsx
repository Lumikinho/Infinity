import { lazy, Suspense, useEffect, useRef, useState } from 'react'

import { GameCard } from '../components/GameCard'
import { AsciiWordmark } from '../components/AsciiWordmark'
import { LoadError } from '../components/LoadError'
import { listGames } from '../lib/api'
import { screenHashes } from '../lib/routes'
import type { Game } from '../types'

type LoadState = 'loading' | 'ready' | 'error'

const AsciiBackdrop = lazy(() =>
  import('../components/AsciiBackdrop').then(({ AsciiBackdrop: Component }) => ({
    default: Component,
  })),
)

interface SectionHeaderProps {
  id: string
  title: string
  description: string
  href?: string
  linkLabel?: string
}

function SectionHeader({ id, title, description, href, linkLabel }: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 id={id} className="text-2xl font-bold tracking-[0.02em]">
          {title}
        </h2>
        <p className="mt-0.5 text-[13px] text-muted">{description}</p>
      </div>

      {href && linkLabel && (
        <a
          href={href}
          className="text-[12px] font-medium uppercase tracking-[0.06em] text-muted underline decoration-line-strong underline-offset-4 transition hover:text-ink hover:decoration-accent"
        >
          {linkLabel}
        </a>
      )}
    </div>
  )
}

function SectionSkeleton() {
  return (
    <div aria-hidden="true" className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="aspect-[2.2] min-h-36 animate-pulse border border-line bg-surface" />
      ))}
    </div>
  )
}

export function HomePage() {
  const heroRef = useRef<HTMLElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [games, setGames] = useState<Game[]>([])
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motionPreference.matches) return

    let frame = 0
    const updateProgress = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        const hero = heroRef.current
        if (!hero) return

        const progress = Math.max(
          0,
          Math.min(1, -hero.getBoundingClientRect().top / window.innerHeight),
        )
        setScrollProgress(progress)
      })
    }

    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)

    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
      window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    let active = true

    setLoadState('loading')
    setError(null)

    listGames()
      .then((gameList) => {
        if (!active) return

        setGames([...gameList].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')))
        setLoadState('ready')
      })
      .catch((cause) => {
        if (!active) return

        setError(cause instanceof Error ? cause.message : 'Erro ao carregar o site.')
        setLoadState('error')
      })

    return () => {
      active = false
    }
  }, [reloadToken])

  const ready = loadState === 'ready'

  return (
    <>
      <section ref={heroRef} className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-black px-5 pb-32 text-center sm:pb-36">
        <div className="absolute inset-0" style={{ opacity: Math.max(0, 1 - scrollProgress * 2) }}>
          <Suspense fallback={null}>
            <AsciiBackdrop />
          </Suspense>
        </div>
        <h1 aria-label="Infinity" className="relative z-[1] select-none text-ink"><AsciiWordmark className="max-w-full overflow-hidden text-left" /></h1>
      </section>
      <div id="home-content" className="mx-auto w-full max-w-6xl scroll-mt-8 px-5 pb-16 sm:px-8">
      {loadState === 'error' && (
        <LoadError
          message={error ?? 'Erro ao carregar o site.'}
          onRetry={() => setReloadToken((current) => current + 1)}
        />
      )}

      {loadState === 'loading' && (
        <div role="status" className="sr-only">
          Carregando conteÃºdo
        </div>
      )}

      {ready && (
        <>
          <section aria-labelledby="home-games-heading" className="mt-12">
            <SectionHeader
              id="home-games-heading"
              title="Jogos"
              description="Veja os jogos e seus campeonatos."
              href={screenHashes.games}
              linkLabel="Ver todos"
            />

            {games.length === 0 ? (
              <p className="mt-4 border border-dashed border-line-strong bg-surface px-6 py-10 text-center text-sm text-muted">
                Nenhum jogo cadastrado ainda.
              </p>
            ) : (
              <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {games.map((game) => (
                  <li key={game.id}>
                    <GameCard game={game} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {loadState === 'loading' && (
        <div className="mt-12">
          <SectionSkeleton />
        </div>
      )}
      </div>
    </>
  )
}
