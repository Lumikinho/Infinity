import type { MatchStatus, UserRole } from '../types'

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatDateTime(value?: string | null) {
  if (!value) return 'não disponível'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'não disponível'

  return dateTimeFormatter.format(date)
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatDate(value?: string | null) {
  if (!value) return 'não definido'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'não definido'

  return dateFormatter.format(date)
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

export function formatCurrency(value?: number | null) {
  if (value === null || value === undefined) return 'A definir'

  return currencyFormatter.format(value)
}

export const roleLabels: Record<UserRole, string> = {
  USER: 'Usuário',
  ADMIN: 'Administrador',
  PLAYER: 'Jogador',
}

export const roleStyles: Record<UserRole, string> = {
  USER: 'border-line-strong bg-transparent text-ink',
  ADMIN: 'border-accent bg-accent text-canvas',
  PLAYER: 'border-line-strong bg-neutral-200 text-ink',
}

export const roleOptions: Array<{ value: UserRole; label: string }> = [
  { value: 'USER', label: 'Usuário' },
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'PLAYER', label: 'Jogador' },
]

export const matchStatusLabels: Record<MatchStatus, string> = {
  SCHEDULED: 'Agendada',
  LIVE: 'Ao vivo',
  FINISHED: 'Encerrada',
}
