import { useEffect, useState, type ReactNode } from 'react'

import { cn } from '../lib/format'
import { AsciiFooterBackdrop } from './AsciiFooterBackdrop'
import { publicNav, screenHashes } from '../lib/routes'
import type { AppScreen } from '../lib/routes'
import type { User } from '../types'

interface PublicShellProps {
  current: AppScreen
  user: User | null
  children: ReactNode
}

function isActive(current: AppScreen, screen: AppScreen) {
  if (screen === 'games') {
    return current === 'games' || current === 'gameDetail' || current === 'brawlStars'
  }

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
  const [isScrolled, setIsScrolled] = useState(() => window.scrollY > 24)

  const panelHref = user ? screenHashes[user.role === 'PLAYER' ? 'player' : 'users'] : null

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 24)

    window.addEventListener('scroll', updateScrollState, { passive: true })
    updateScrollState()
    window.addEventListener('resize', updateScrollState)

    return () => {
      window.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [])

  return (
    <div className="flex min-h-dvh flex-col">
      {current !== 'home' && (
        <header
          className={cn(
            'z-20 transition-[top,width,margin,border-radius,background-color,box-shadow] duration-300 ease-out',
            'sticky top-0 mx-auto w-full border-b border-line bg-canvas/95 backdrop-blur-sm',
            isScrolled &&
              'top-3 w-[min(74rem,calc(100%-1.5rem))] rounded-full border border-white/15 bg-canvas/75 shadow-xl shadow-black/20 backdrop-blur-xl',
          )}
        >
          <div
            className={cn(
              'flex items-center justify-between gap-4 transition-[padding] duration-300',
              current === 'games' && !isScrolled
                ? 'w-full px-[3.4vw] py-1.5'
                : 'mx-auto w-full max-w-6xl px-4 py-1 sm:px-6',
              isScrolled && 'py-1',
            )}
          >
            <a href={screenHashes.home} className="group flex shrink-0 items-center gap-2.5 py-1.5">
              <span aria-hidden="true" className="h-6 w-1.5 bg-accent" />
              <span className="font-display text-xl font-bold uppercase leading-none tracking-[0.04em]">
                Infinity
              </span>
              <span
                className={cn(
                  'mt-0.5 hidden text-[10px] font-medium uppercase tracking-[0.18em] text-muted sm:inline',
                  isScrolled && 'sm:hidden',
                )}
              >
                Circuito competitivo
              </span>
            </a>

            <nav aria-label="Navegação principal" className="hidden items-center gap-1 sm:flex">
              {publicNav.map((item) => (
                <a
                  key={item.screen}
                  href={screenHashes[item.screen]}
                  aria-current={isActive(current, item.screen) ? 'page' : undefined}
                  className={navLinkClass(isActive(current, item.screen), isScrolled)}
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
                  isScrolled
                    ? 'rounded-full border border-white/25 px-4 py-2'
                    : 'border border-line-strong px-3 py-2',
                )}
              >
                {user?.role === 'PLAYER' ? 'Meu espaço' : 'Painel'}
              </a>
            ) : (
              <span
                className={cn(
                  'hidden shrink-0 text-[10px] font-medium uppercase tracking-[0.18em] text-muted sm:block',
                  isScrolled && 'lg:block',
                )}
              >
                Jogos e jogadores
              </span>
            )}
          </div>

          <nav
            aria-label="Navegação principal"
            className={cn(
              'overflow-x-auto px-2 sm:hidden',
              isScrolled ? 'border-t border-white/10' : 'border-t border-line',
            )}
          >
            <div className="flex gap-1">
              {publicNav.map((item) => (
                <a
                  key={item.screen}
                  href={screenHashes[item.screen]}
                  aria-current={isActive(current, item.screen) ? 'page' : undefined}
                  className={navLinkClass(isActive(current, item.screen), isScrolled)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
        </header>
      )}

      <main
        className={
          current === 'home'
            ? 'w-full flex-1'
            : current === 'games'
              ? 'w-full flex-1 px-[3.4vw] py-8 sm:py-8'
              : 'mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 sm:py-12'
        }
      >
        {children}
      </main>

      <footer className="relative isolate overflow-hidden border-t border-line">
        <AsciiFooterBackdrop />
        <div className="relative z-[1] mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-8 text-[12px] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.08em] text-ink">
            <span aria-hidden="true" className="h-4 w-1 bg-accent" />
            Infinity
          </p>
          <p>Brawl Stars, jogos, jogadores e campeonatos.</p>
        </div>
      </footer>
    </div>
  )
}
