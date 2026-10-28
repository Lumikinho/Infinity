import { AnimatePresence, motion } from 'motion/react'
import { Avatar } from './Avatar'
import { AlertIcon, PencilIcon, PlusIcon, RefreshIcon, TrashIcon, UsersIcon } from './Icons'
import { avatarUrl } from '../lib/api'
import { cn, formatDate, roleBadgeStyles, roleLabels } from '../lib/utils'
import type { ApiStatus, User, UserRole } from '../types'

const rowGrid =
  'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:grid-cols-[minmax(0,1fr)_7.5rem_6.5rem_5.5rem]'

interface UserListProps {
  users: User[]
  total: number
  status: ApiStatus
  error: string | null
  hasFilters: boolean
  onRetry: () => void
  onClearFilters: () => void
  onNew: () => void
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset',
        roleBadgeStyles[role],
      )}
    >
      {roleLabels[role]}
    </span>
  )
}

function Skeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 border-b border-line/70 px-4 py-4 last:border-0 sm:px-5"
        >
          <div className="size-10 shrink-0 animate-pulse rounded-full bg-neutral-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 animate-pulse rounded-full bg-neutral-100" />
            <div className="h-3 w-48 animate-pulse rounded-full bg-neutral-100/80" />
          </div>
          <div className="hidden h-5 w-16 animate-pulse rounded-full bg-neutral-100 sm:block" />
          <div className="hidden h-3 w-14 animate-pulse rounded-full bg-neutral-100 md:block" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({
  hasFilters,
  onClearFilters,
  onNew,
}: {
  hasFilters: boolean
  onClearFilters: () => void
  onNew: () => void
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-20 text-center">
      <span className="grid size-14 place-items-center rounded-full border border-line bg-surface text-muted">
        <UsersIcon className="size-6" />
      </span>
      <h3 className="mt-5 text-base font-medium tracking-[-0.01em]">
        {hasFilters ? 'Nenhum resultado' : 'Nenhum usuário ainda'}
      </h3>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted">
        {hasFilters
          ? 'Tente outro nome, email ou função para encontrar quem procura.'
          : 'Cadastre a primeira pessoa da equipe para começar a organizar tudo.'}
      </p>
      <button
        type="button"
        onClick={hasFilters ? onClearFilters : onNew}
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-medium text-white transition hover:bg-neutral-800"
      >
        {!hasFilters && <PlusIcon className="size-4" />}
        {hasFilters ? 'Limpar filtros' : 'Cadastrar usuário'}
      </button>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-line bg-surface px-6 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-rose-50 text-rose-600 ring-1 ring-rose-100">
        <AlertIcon className="size-6" />
      </span>
      <h3 className="mt-5 text-base font-medium tracking-[-0.01em]">Não foi possível carregar</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-medium transition hover:border-ink/20 hover:bg-canvas"
      >
        <RefreshIcon className="size-4" />
        Tentar novamente
      </button>
    </div>
  )
}

export function UserList({
  users,
  total,
  status,
  error,
  hasFilters,
  onRetry,
  onClearFilters,
  onNew,
  onEdit,
  onDelete,
}: UserListProps) {
  if (status === 'loading' && users.length === 0) return <Skeleton />
  if (error && users.length === 0) return <ErrorState message={error} onRetry={onRetry} />
  if (users.length === 0) {
    return <EmptyState hasFilters={hasFilters} onClearFilters={onClearFilters} onNew={onNew} />
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div
        className={cn(
          rowGrid,
          'hidden border-b border-line bg-[#fbfaf7] px-5 py-3 text-[10px] font-medium uppercase tracking-[0.14em] text-muted md:grid',
        )}
      >
        <span>Usuário</span>
        <span>Função</span>
        <span>Desde</span>
        <span className="text-right">Ações</span>
      </div>

      <ul>
        <AnimatePresence initial={false} mode="popLayout">
          {users.map((user) => (
            <motion.li
              key={user.UUID}
              layout="position"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className={cn(
                rowGrid,
                'group border-b border-line/70 px-4 py-3.5 transition-colors last:border-0 hover:bg-[#fbfaf7] sm:px-5',
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={user.name} src={avatarUrl(user.profilePic)} />
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="min-w-0 truncate text-sm font-medium tracking-[-0.01em]">{user.name}</p>
                    <span className="md:hidden">
                      <RoleBadge role={user.role} />
                    </span>
                  </div>
                  <p className="truncate text-[13px] text-muted">{user.email}</p>
                </div>
              </div>

              <div className="hidden md:block">
                <RoleBadge role={user.role} />
              </div>

              <p className="hidden text-[13px] tabular-nums text-muted md:block">
                {formatDate(user.createdAt)}
              </p>

              <div className="row-actions flex items-center justify-end gap-0.5">
                <button
                  type="button"
                  onClick={() => onEdit(user)}
                  aria-label={`Editar ${user.name}`}
                  title="Editar"
                  className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-ink/5 hover:text-ink"
                >
                  <PencilIcon className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(user)}
                  aria-label={`Excluir ${user.name}`}
                  title="Excluir"
                  className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-rose-50 hover:text-rose-600"
                >
                  <TrashIcon className="size-4" />
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <div className="flex items-center justify-between border-t border-line bg-[#fbfaf7] px-4 py-3 sm:px-5">
        <p className="text-[11px] tabular-nums text-muted">
          {hasFilters ? `${users.length} de ${total}` : `${total} ${total === 1 ? 'usuário' : 'usuários'}`}
        </p>
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
          {hasFilters ? 'filtro ativo' : 'equipe infinity'}
        </p>
      </div>
    </div>
  )
}
