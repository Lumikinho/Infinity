import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { PlusIcon, RefreshIcon, SearchIcon, XIcon } from './Icons'
import { cn, roleOptions } from '../lib/utils'
import type { RoleFilter } from '../types'

interface ToolbarProps {
  query: string
  role: RoleFilter
  refreshing: boolean
  onQueryChange: (value: string) => void
  onRoleChange: (value: RoleFilter) => void
  onRefresh: () => void
  onNew: () => void
}

const filters: Array<{ value: RoleFilter; label: string }> = [
  { value: 'ALL', label: 'Todos' },
  ...roleOptions,
]

export function Toolbar({
  query,
  role,
  refreshing,
  onQueryChange,
  onRoleChange,
  onRefresh,
  onNew,
}: ToolbarProps) {
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      if (document.querySelector('[role="dialog"]')) return

      const target = event.target as HTMLElement | null

      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return

      event.preventDefault()
      searchRef.current?.focus()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div
        role="group"
        aria-label="Filtrar por função"
        className="no-scrollbar flex items-center gap-1 self-start overflow-x-auto rounded-full border border-line bg-surface p-1"
      >
        {filters.map((filter) => {
          const active = role === filter.value

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onRoleChange(filter.value)}
              aria-pressed={active}
              className="relative shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors"
            >
              {active && (
                <motion.span
                  layoutId="role-pill"
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className={cn('relative z-10', active ? 'text-white' : 'text-muted hover:text-ink')}>
                {filter.label}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar por nome ou email"
            aria-label="Buscar usuários"
            className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-9 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-ink/25 focus:ring-4 focus:ring-ink/[0.04] [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              aria-label="Limpar busca"
              className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted transition hover:bg-canvas hover:text-ink"
            >
              <XIcon className="size-3.5" />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-line bg-canvas px-1.5 py-0.5 text-[10px] font-medium text-muted sm:block">
              /
            </kbd>
          )}
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Atualizar lista"
          title="Atualizar lista"
          className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-surface text-muted transition hover:border-ink/20 hover:text-ink disabled:opacity-60"
        >
          <RefreshIcon className={cn('size-4', refreshing && 'animate-spin')} />
        </button>

        <button
          type="button"
          onClick={onNew}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-ink px-3.5 text-sm font-medium text-white transition hover:bg-neutral-800 active:scale-[0.99] sm:px-4"
        >
          <PlusIcon className="size-4" />
          <span className="hidden sm:inline">Novo usuário</span>
          <span className="sm:hidden">Novo</span>
        </button>
      </div>
    </div>
  )
}
