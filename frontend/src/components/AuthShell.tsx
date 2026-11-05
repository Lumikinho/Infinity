import type { ReactNode } from 'react'

interface AuthShellProps {
  eyebrow: string
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

export function AuthShell({ eyebrow, title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-2">
      <aside className="hidden flex-col justify-between border-r border-line bg-surface px-10 py-12 lg:flex xl:px-14">
        <p className="flex items-center gap-2.5 font-display text-lg font-bold uppercase tracking-[0.06em]">
          <span aria-hidden="true" className="h-5 w-1 bg-accent" />
          Infinity
        </p>

        <div className="max-w-sm">
          <p className="font-display text-5xl font-bold uppercase leading-[0.95] tracking-[0.01em]">
            Contas, jogadores, times e jogos em um só lugar.
          </p>
          <p className="mt-6 text-sm leading-relaxed text-muted">
            Organize o elenco, monte os times e mantenha cada jogo em dia sem sair da tela.
          </p>
        </div>

        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          Acesso restrito a contas cadastradas.
        </p>
      </aside>

      <main className="flex min-h-dvh flex-col justify-center px-5 py-12 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <p className="flex items-center gap-2 font-display text-lg font-bold uppercase tracking-[0.06em] lg:hidden">
            <span aria-hidden="true" className="h-5 w-1 bg-accent" />
            Infinity
          </p>

          <p className="mt-10 text-[11px] font-medium uppercase tracking-[0.14em] text-muted lg:mt-0">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <div className="mt-8 border-t border-line pt-5 text-sm text-muted">{footer}</div>
        </div>
      </main>
    </div>
  )
}
