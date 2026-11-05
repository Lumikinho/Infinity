import { useEffect, useState, type ReactNode } from 'react'

import { cn } from '../lib/format'
import { AsciiFooterBackdrop } from './AsciiFooterBackdrop'
import { AsciiWordmark } from './AsciiWordmark'
import { publicNav, screenHashes } from '../lib/routes'
import type { AppScreen } from '../lib/routes'
import type { User } from '../types'

interface PublicShellProps {
  current: AppScreen
  user: User | null
  children: ReactNode
}

function isActive(current: AppScreen, screen: AppScreen) {
  if (screen === 'games') return current === 'games' || current === 'gameDetail'

  return current === screen
}

function navLinkClass(active: boolean, pill: boolean) {
  return cn(
    'flex min-h-10 shrink-0 items-center font-display text-sm font-semibold uppercase tracking-[0.08em] transition',
    pill
      ? 'rounded-full border border-transparent px-4 hover:border-white/20 hover:bg-white/10'
      : 'border-b-2 px-3',
    active
      ? pill
        ? 'border-white/25 bg-white text-black hover:bg-white/90'
        : 'border-accent text-ink'
      : pill
        ? 'text-muted hover:text-ink'
        : 'border-transparent text-muted hover:border-line-strong hover:text-ink',
  )
}

export function PublicShell({ current, user, children }: PublicShellProps) {
  const [scrollPosition, setScrollPosition] = useState(() => window.scrollY)
  const home = current === 'home'
  const isScrolled = scrollPosition > 24
  const pill = isScrolled
  const panelHref = user ? screenHashes[user.role === 'PLAYER' ? 'player' : 'users'] : null

  useEffect(() => {
    const updateScrollState = () => setScrollPosition(window.scrollY)
    window.addEventListener('scroll', updateScrollState, { passive: true })
    updateScrollState()
    window.addEventListener('resize', updateScrollState)
    return () => {
      window.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [])

  const transitionProgress = home
    ? Math.max(0, Math.min(1, scrollPosition / (window.innerHeight * 0.7)))
    : 0
  const startWidth = Math.min(window.innerWidth - 24, window.innerWidth < 640 ? 248 : 440)
  const targetWidth = Math.min(1184, window.innerWidth - 24)
  const morphWidth = startWidth + (targetWidth - startWidth) * transitionProgress
  const wordmarkWidth = window.innerWidth < 360 ? 64 : window.innerWidth < 420 ? 80 : 112
  const startTop = window.innerHeight - window.innerHeight * 0.08 - 48
  const morphTop = startTop + (12 - startTop) * transitionProgress

  return (
    <div className="flex min-h-dvh flex-col">
      {home && (
        <nav
          aria-label="Navegação principal"
          className="fixed z-30 flex -translate-x-1/2 items-center justify-between gap-2 overflow-hidden border transition-[background-color,border-color,box-shadow,padding] duration-200"
          style={{
            top: `${morphTop}px`,
            left: '50%',
            width: `${morphWidth}px`,
            minHeight: `${48 + transitionProgress * 12}px`,
            padding: `0 ${transitionProgress * 12}px`,
            borderRadius: '9999px',
            borderColor: `rgba(255,255,255,${transitionProgress * 0.26})`,
            backgroundColor: `rgba(10,11,13,${transitionProgress * 0.76})`,
            boxShadow: `0 16px 44px rgba(0,0,0,${transitionProgress * 0.32})`,
            backdropFilter: `blur(${transitionProgress * 18}px)`,
            WebkitBackdropFilter: `blur(${transitionProgress * 18}px)`,
            justifyContent: 'space-between',
          }}
        >
          <a
            href={screenHashes.home}
            aria-label="Infinity"
            className="flex shrink-0 items-center justify-center overflow-hidden transition-[width,opacity] duration-200"
            style={{ width: `${wordmarkWidth * transitionProgress}px`, opacity: transitionProgress }}
          >
            <AsciiWordmark
              className="ascii-wordmark-compact"
              style={{ fontSize: `${wordmarkWidth / 35.4}px` }}
            />
          </a>
          <div className="ml-auto flex shrink-0 items-center gap-2">
          <a
            href={screenHashes.games}
            className="hero-morph-link min-w-0 border px-2 py-2 font-display text-xs font-bold uppercase tracking-[0.08em] transition-colors hover:text-white sm:min-w-44 sm:px-7 sm:py-3.5 sm:text-sm sm:tracking-[0.1em]"
            style={{
              borderRadius: `${24 * (1 - transitionProgress)}px`,
              borderColor: `rgba(243,245,244,${0.28 * (1 - transitionProgress)})`,
              backgroundColor: `rgba(243,245,244,${0.09 * (1 - transitionProgress)})`,
              backdropFilter: `blur(${14 * (1 - transitionProgress)}px)`,
            }}
          >
            Jogos
          </a>
          <a
            href={screenHashes.players}
            className="hero-morph-link min-w-0 border px-2 py-2 font-display text-xs font-bold uppercase tracking-[0.08em] transition-colors hover:text-white sm:min-w-44 sm:px-7 sm:py-3.5 sm:text-sm sm:tracking-[0.1em]"
            style={{
              borderRadius: `${24 * (1 - transitionProgress)}px`,
              borderColor: `rgba(243,245,244,${0.28 * (1 - transitionProgress)})`,
              backgroundColor: `rgba(243,245,244,${0.09 * (1 - transitionProgress)})`,
              backdropFilter: `blur(${14 * (1 - transitionProgress)}px)`,
            }}
          >
            Jogadores
          </a>
          <a
            href="#home-content"
            aria-label="Rolar para conteúdo"
            aria-hidden={transitionProgress > 0.98}
            tabIndex={transitionProgress > 0.98 ? -1 : 0}
            className="hero-pill flex size-11 shrink-0 items-center justify-center overflow-hidden transition-[width,opacity] duration-200 sm:size-12"
            style={{ width: `${44 * (1 - transitionProgress)}px`, opacity: 1 - transitionProgress }}
          >
            <span aria-hidden="true" className="hero-down-arrow" />
          </a>
          </div>
        </nav>
      )}
      {!home && <header
        className={cn(
          'z-20 transition-[top,width,margin,border-radius,background-color,box-shadow,opacity,transform] duration-300 ease-out',
          home
            ? 'fixed inset-x-0 top-3 mx-auto w-[min(74rem,calc(100%-1.5rem))] border border-white/15 bg-canvas/75 shadow-xl shadow-black/20 backdrop-blur-xl'
            : 'sticky top-0 mx-auto w-full border-b border-line bg-canvas/95 backdrop-blur-sm',
          pill && !home && 'top-3 w-[min(74rem,calc(100%-1.5rem))] rounded-full border border-white/15 bg-canvas/75 shadow-xl shadow-black/20 backdrop-blur-xl',
          home && isScrolled && 'translate-y-0 rounded-full opacity-100',
          home && !isScrolled && 'pointer-events-none -translate-y-4 opacity-0',
        )}
      >
        <div
          className={cn(
            'flex items-center justify-between gap-4 transition-[padding] duration-300',
            current === 'games' && !pill
              ? 'w-full px-[3.4vw] py-1.5'
              : 'mx-auto w-full max-w-6xl px-4 py-1 sm:px-6',
            pill && 'py-1',
          )}
        >
          <a href={screenHashes.home} className="group flex shrink-0 items-center gap-2.5 py-1.5">
            <span aria-hidden="true" className="h-6 w-1.5 bg-accent" />
            <span className="font-display text-xl font-bold uppercase leading-none tracking-[0.04em]">
              Infinity
            </span>
            <span className={cn('mt-0.5 hidden text-[10px] font-medium uppercase tracking-[0.18em] text-muted sm:inline', pill && 'sm:hidden')}>
              Circuito competitivo
            </span>
          </a>

          <nav aria-label="Navegação principal" className="hidden items-center gap-1 sm:flex">
            {publicNav.map((item) => (
              <a
                key={item.screen}
                href={screenHashes[item.screen]}
                aria-current={isActive(current, item.screen) ? 'page' : undefined}
                className={navLinkClass(isActive(current, item.screen), pill)}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {panelHref ? (
            <a
              href={panelHref}
              className={cn(
                'shrink-0 font-display text-[13px] font-semibold uppercase tracking-[0.08em] transition hover:border-white hover:text-white',
                pill ? 'rounded-full border border-white/25 px-4 py-2' : 'border border-line-strong px-3 py-2',
              )}
            >
              {user?.role === 'PLAYER' ? 'Meu espaço' : 'Painel'}
            </a>
          ) : (
            <span className={cn('hidden shrink-0 text-[10px] font-medium uppercase tracking-[0.18em] text-muted sm:block', pill && 'lg:block', home && 'hidden')}>
              Jogos e jogadores
            </span>
          )}
        </div>

        <nav
          aria-label="Navegação principal"
          className={cn(
            'overflow-x-auto px-2 sm:hidden',
            pill ? 'border-t border-white/10' : 'border-t border-line',
          )}
        >
          <div className="flex gap-1">
            {publicNav.map((item) => (
              <a
                key={item.screen}
                href={screenHashes[item.screen]}
                aria-current={isActive(current, item.screen) ? 'page' : undefined}
                className={navLinkClass(isActive(current, item.screen), pill)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      </header>}

      <main className={current === 'home' ? 'w-full flex-1' : current === 'games' ? 'w-full flex-1 px-[3.4vw] py-8 sm:py-8' : 'mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 sm:py-12'}>{children}</main>

      <footer className="relative isolate overflow-hidden border-t border-line">
        <AsciiFooterBackdrop />
        <div className="relative z-[1] mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-8 text-[12px] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.08em] text-ink">
            <span aria-hidden="true" className="h-4 w-1 bg-accent" />
            Infinity
          </p>
          <p>Jogos, jogadores e campeonatos.</p>
        </div>
      </footer>
    </div>
  )
}
