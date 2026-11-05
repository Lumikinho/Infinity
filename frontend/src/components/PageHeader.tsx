import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description: string
  children?: ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div>
        <p className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
          <span aria-hidden="true" className="h-px w-7 bg-accent" />
          Painel de controle
        </p>
        <h1 className="text-4xl font-bold leading-none tracking-[0.01em]">{title}</h1>
        <p className="mt-2 text-sm text-muted">{description}</p>
      </div>

      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  )
}
