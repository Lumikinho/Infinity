import { lazy, Suspense, useEffect, useRef, useState } from 'react'

import { AsciiWordmark } from '../components/AsciiWordmark'
import { screenHashes } from '../lib/routes'

const AsciiBackdrop = lazy(() =>
  import('../components/AsciiBackdrop').then(({ AsciiBackdrop: Component }) => ({
    default: Component,
  })),
)

export function HomePage() {
  const heroRef = useRef<HTMLElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

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

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-black px-5 py-20 text-center"
    >
      <div className="absolute inset-0" style={{ opacity: Math.max(0, 1 - scrollProgress * 2) }}>
        <Suspense fallback={null}>
          <AsciiBackdrop />
        </Suspense>
      </div>

      <h1 aria-label="Infinity" className="relative z-[1] select-none text-ink">
        <AsciiWordmark className="max-w-full overflow-hidden text-left" />
      </h1>

      <a
        id="home-content"
        href={screenHashes.brawlStars}
        className="group relative z-[1] mt-10 block w-full max-w-xl scroll-mt-8 border border-white/20 bg-white/[0.03] p-6 text-left transition hover:border-white hover:bg-white/[0.06] focus-visible:border-white sm:mt-14 sm:p-8"
      >
        <span className="flex items-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
          <span aria-hidden="true" className="h-px w-8 bg-accent" />
          Jogo em destaque
        </span>

        <span className="mt-3 flex items-end justify-between gap-4">
          <span className="min-w-0">
            <span className="block font-display text-4xl font-bold uppercase leading-none tracking-[0.01em] text-ink transition group-hover:text-accent sm:text-5xl">
              Brawl Stars
            </span>
            <span className="mt-3 block text-[13px] leading-relaxed text-muted">
              Elenco, campeonatos, premiações e calendário de partidas.
            </span>
          </span>

          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center border border-white/25 text-lg text-ink transition group-hover:border-accent"
          >
            →
          </span>
        </span>

        <span className="mt-5 block text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
          Abrir página
        </span>
      </a>
    </section>
  )
}
