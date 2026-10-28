import type { UserRole } from '../types'

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
})

export function formatDate(value?: string | null) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '—'

  return dateFormatter.format(date)
}

export const roleLabels: Record<UserRole, string> = {
  USER: 'Usuário',
  ADMIN: 'Admin',
  PLAYER: 'Jogador',
}

export const roleBadgeStyles: Record<UserRole, string> = {
  USER: 'bg-neutral-100 text-neutral-600 ring-neutral-200/80',
  ADMIN: 'bg-indigo-50 text-indigo-700 ring-indigo-200/70',
  PLAYER: 'bg-emerald-50 text-emerald-700 ring-emerald-200/70',
}

export const roleOptions: Array<{ value: UserRole; label: string }> = [
  { value: 'ADMIN', label: 'Admins' },
  { value: 'PLAYER', label: 'Jogadores' },
  { value: 'USER', label: 'Usuários' },
]
