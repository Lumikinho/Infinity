import type { CreateUserInput, User, UserInput } from '../types'

const rawBase = import.meta.env.VITE_API_URL as string | undefined
const API_BASE = (rawBase ?? '').replace(/\/+$/, '')

export const uploadsBase = `${API_BASE}/uploads`

export function avatarUrl(profilePic: string | null) {
  if (!profilePic) return null
  if (/^https?:\/\//i.test(profilePic)) return profilePic
  return `${uploadsBase}/${encodeURIComponent(profilePic)}`
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function readMessage(payload: unknown) {
  if (!payload || typeof payload !== 'object') return null

  const data = payload as { message?: unknown; error?: { code?: unknown } }

  if (typeof data.message === 'string' && data.message.trim()) return data.message

  const code = data.error?.code

  if (code === 'P2002') return 'Este email já está em uso.'
  if (code === 'P2025') return 'Usuário não encontrado.'

  return null
}

function fallbackMessage(status: number) {
  if (status === 404) return 'Recurso não encontrado.'
  if (status === 409) return 'Já existe um registro com esses dados.'
  if (status === 413) return 'O arquivo enviado é muito grande.'
  if (status >= 500) return 'Erro inesperado no servidor. Tente novamente.'

  return 'Não foi possível concluir a solicitação.'
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_BASE}${path}`, init)
  } catch {
    throw new ApiError('Não foi possível conectar à API. Verifique se o servidor está rodando.', 0)
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const message = readMessage(payload) ?? fallbackMessage(response.status)

    throw new ApiError(message, response.status)
  }

  if (response.status === 204) return undefined as T

  return (await response.json()) as T
}

function buildFormData(input: UserInput) {
  const data = new FormData()

  data.append('name', input.name.trim())
  data.append('email', input.email.trim())

  if (input.password) data.append('password', input.password)
  if (input.profilePic instanceof File) data.append('profilePic', input.profilePic)

  return data
}

export async function listUsers() {
  const data = await request<{ database?: User[]; message?: string }>('/api/user')

  return data.database ?? []
}

export function createUser(input: CreateUserInput) {
  return request<User>('/api/user', {
    method: 'POST',
    body: buildFormData(input),
  })
}

export function updateUser(UUID: string, input: UserInput) {
  return request<User>(`/api/user/${encodeURIComponent(UUID)}`, {
    method: 'PUT',
    body: buildFormData(input),
  })
}

export function deleteUser(UUID: string) {
  return request<void>(`/api/user/${encodeURIComponent(UUID)}`, {
    method: 'DELETE',
  })
}
