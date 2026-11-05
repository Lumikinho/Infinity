import type {
  Championship,
  ChampionshipInput,
  ChampionshipMatch,
  Game,
  MatchInput,
  Player,
  PlayerInput,
  Team,
  TeamInput,
  User,
  UserInput,
} from '../types'

const env = import.meta.env

// Em desenvolvimento o padrão é passar pelo proxy do Vite (VITE_API_URL_LOCAL).
// Em produção usamos a URL pública da API (VITE_API_URL_PUBLIC).
// VITE_API_URL continua aceito como atalho/compatibilidade.
const rawBase = env.DEV
  ? (env.VITE_API_URL ?? '')
  : (env.VITE_API_URL_PUBLIC ?? env.VITE_API_URL ?? '')

const API_BASE = rawBase.replace(/\/+$/, '')

const uploadsBase = `${API_BASE}/uploads`

export function avatarUrl(profilePic: string | null) {
  if (!profilePic) return null
  if (/^https?:\/\//i.test(profilePic)) return profilePic

  return `${uploadsBase}/${encodeURIComponent(profilePic)}`
}

export const imageUrl = avatarUrl

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
  if (status === 409) return 'Já existe uma conta com este email.'
  if (status === 413) return 'O arquivo enviado é muito grande.'
  if (status >= 500) return 'Erro inesperado no servidor. Tente novamente.'

  return 'Não foi possível concluir a solicitação.'
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_BASE}${path}`, init)
  } catch {
    throw new ApiError(
      'Não foi possível conectar à API. Verifique se o servidor está rodando.',
      0,
    )
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
  data.append('role', input.role)

  if (input.password) data.append('password', input.password)
  if (input.profilePic instanceof File) data.append('profilePic', input.profilePic)

  return data
}

export async function login(email: string, password: string) {
  const data = await request<{ user: User }>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password }),
  })

  return data.user
}

export async function listUsers() {
  const data = await request<{ database?: User[] }>('/api/user')

  return data.database ?? []
}

export function createUser(input: UserInput) {
  return request<User>('/api/user', { method: 'POST', body: buildFormData(input) })
}

export function updateUser(UUID: string, input: UserInput) {
  return request<User>(`/api/user/${encodeURIComponent(UUID)}`, {
    method: 'PUT',
    body: buildFormData(input),
  })
}

export function deleteUser(UUID: string) {
  return request<void>(`/api/user/${encodeURIComponent(UUID)}`, { method: 'DELETE' })
}

type GamePayload = {
  id: string
  name: string
}

export async function listGames(): Promise<Game[]> {
  const data = await request<{
    database?: Array<GamePayload & { _count?: { teams?: number } }>
  }>('/api/game')

  return (data.database ?? []).map((game) => ({
    id: game.id,
    name: game.name,
    teamsCount: game._count?.teams ?? 0,
  }))
}

export async function createGame(name: string) {
  const game = await request<GamePayload>('/api/game', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })

  return { ...game, teamsCount: 0 }
}

export function updateGame(id: string, name: string) {
  return request<GamePayload>(`/api/game/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
}

export function deleteGame(id: string) {
  return request<void>(`/api/game/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

function buildPlayerFormData(input: PlayerInput) {
  const data = new FormData()

  data.append('nickname', input.nickname.trim())
  data.append('realName', input.realName.trim())
  data.append('country', input.country.trim())
  data.append('userId', input.userId)

  if (input.photo instanceof File) data.append('photo', input.photo)

  return data
}

export async function listPlayers() {
  const data = await request<{ database?: Player[] }>('/api/player')

  return data.database ?? []
}

export function getPlayer(id: string) {
  return request<Player>(`/api/player/${encodeURIComponent(id)}`)
}

export async function findPlayerByUser(userId: string): Promise<Player | null> {
  try {
    return await request<Player>(`/api/player/user/${encodeURIComponent(userId)}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null

    throw error
  }
}

export function createPlayer(input: PlayerInput) {
  return request<Player>('/api/player', { method: 'POST', body: buildPlayerFormData(input) })
}

export function updatePlayer(id: string, input: PlayerInput) {
  return request<Player>(`/api/player/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: buildPlayerFormData(input),
  })
}

export function deletePlayer(id: string) {
  return request<void>(`/api/player/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

function buildTeamFormData(input: TeamInput) {
  const data = new FormData()

  data.append('name', input.name.trim())
  data.append('tag', input.tag.trim())
  data.append('gameId', input.gameId)
  data.append('playerIds', JSON.stringify(input.playerIds))

  if (input.logo instanceof File) data.append('logo', input.logo)

  return data
}

export async function listTeams() {
  const data = await request<{ database?: Team[] }>('/api/team')

  return data.database ?? []
}

export function getTeam(id: string) {
  return request<Team>(`/api/team/${encodeURIComponent(id)}`)
}

export function createTeam(input: TeamInput) {
  return request<Team>('/api/team', { method: 'POST', body: buildTeamFormData(input) })
}

export function updateTeam(id: string, input: TeamInput) {
  return request<Team>(`/api/team/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: buildTeamFormData(input),
  })
}

export function deleteTeam(id: string) {
  return request<void>(`/api/team/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

function jsonRequest(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

export async function listChampionships(): Promise<Championship[]> {
  const data = await request<{ database?: Championship[] }>('/api/championship')

  return data.database ?? []
}

export async function listPlayerChampionships(userId: string): Promise<Championship[]> {
  const data = await request<{ database?: Championship[] }>(
    `/api/championship/player/${encodeURIComponent(userId)}`,
  )

  return data.database ?? []
}

export function createChampionship(input: ChampionshipInput) {
  return request<Championship>('/api/championship', jsonRequest('POST', input))
}

export function updateChampionship(id: string, input: ChampionshipInput) {
  return request<Championship>(
    `/api/championship/${encodeURIComponent(id)}`,
    jsonRequest('PUT', input),
  )
}

export function deleteChampionship(id: string) {
  return request<void>(`/api/championship/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function createMatch(input: MatchInput) {
  return request<ChampionshipMatch>('/api/match', jsonRequest('POST', input))
}

export function updateMatch(id: string, input: MatchInput) {
  return request<ChampionshipMatch>(`/api/match/${encodeURIComponent(id)}`, jsonRequest('PUT', input))
}

export function deleteMatch(id: string) {
  return request<void>(`/api/match/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export interface ExternalTeamSuggestion {
  name: string
  url: string | null
}

export function searchExternalTeams(gameId: string, query: string) {
  const params = new URLSearchParams({ gameId, q: query.trim() })

  return request<{ teams?: ExternalTeamSuggestion[]; supported?: boolean }>(
    `/api/external-team?${params.toString()}`,
  )
}
