import type { User, UserRole } from '../types'

const STORAGE_KEY = 'infinity:user'

const roles: UserRole[] = ['USER', 'ADMIN', 'PLAYER']

export function readSession(): User | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<User> | null

    if (
      !parsed ||
      typeof parsed.UUID !== 'string' ||
      typeof parsed.name !== 'string' ||
      typeof parsed.email !== 'string' ||
      !roles.includes(parsed.role as UserRole)
    ) {
      return null
    }

    return parsed as User
  } catch {
    return null
  }
}

export function writeSession(user: User) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export function clearSession() {
  window.localStorage.removeItem(STORAGE_KEY)
}
