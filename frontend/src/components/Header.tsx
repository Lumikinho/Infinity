import { InfinityIcon } from './Icons'
import { cn } from '../lib/utils'
import type { ApiStatus } from '../types'

const statusConfig: Record<ApiStatus, { label: string; dot: string; text: string }> = {
  loading: { label: 'Conectando', dot: 'bg-amber-400', text: 'text-muted' },
  online: { label: 'Online', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  offline: { label: 'Offline', dot: 'bg-rose-500', text: 'text-rose-700' },
}

export function Header({ status }: { status: ApiStatus }) {
  const current = statusConfig[status]

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5 sm:px-8">
        <a href="/" className="group flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-[10px] bg-ink text-white transition-transform duration-300 group-hover:rotate-6">
            <InfinityIcon className="size-4" strokeWidth={2} />
          </span>
          <span className="flex items-baseline gap-2">
            <span className="text-[15px] font-medium tracking-[-0.02em]">infinity</span>
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.16em] text-muted sm:inline">
              painel
            </span>
          </span>
        </a>

        <div
          className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-2.5 py-1"
          title={`API ${current.label.toLowerCase()}`}
        >
          <span className="relative flex size-1.5">
            {status === 'online' && (
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            )}
            <span className={cn('relative inline-flex size-1.5 rounded-full', current.dot)} />
          </span>
          <span className={cn('text-[10px] font-medium uppercase tracking-[0.14em]', current.text)}>
            {current.label}
          </span>
        </div>
      </div>
    </header>
  )
}
