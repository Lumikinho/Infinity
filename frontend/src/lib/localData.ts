import type {
  Championship,
  ChampionshipInput,
  ChampionshipMatch,
  Game,
  MatchInput,
  MatchStatus,
  Player,
  PlayerInput,
  Team,
  TeamInput,
  User,
  UserInput,
} from '../types'

/*
 * Camada de dados local.
 *
 * O projeto agora é somente frontend: nenhuma chamada HTTP é feita. Os dados
 * ficam no localStorage do navegador e são semeados na primeira execução.
 */

const STORAGE_KEY = 'infinity:data:v1'

interface StoredUser extends User {
  password: string
}

interface StoredGame {
  id: string
  name: string
}

interface StoredPlayer {
  id: string
  nickname: string
  realName: string
  country: string
  photo: string | null
  userId: string
  createdAt: string
}

interface StoredTeam {
  id: string
  name: string
  tag: string
  logo: string | null
  gameId: string
  createdAt: string
  playerIds: string[]
}

interface StoredChampionship {
  id: string
  name: string
  gameId: string
  startDate: string
  endDate: string | null
  prizePool: number | null
  createdAt: string
}

interface StoredMatch {
  id: string
  championshipId: string
  scheduledAt: string
  status: MatchStatus
  homeScore: number | null
  awayScore: number | null
  homeTeamId: string | null
  awayTeamId: string | null
  homeTeamName: string | null
  awayTeamName: string | null
}

interface Store {
  version: number
  users: StoredUser[]
  games: StoredGame[]
  players: StoredPlayer[]
  teams: StoredTeam[]
  championships: StoredChampionship[]
  matches: StoredMatch[]
}

export class DataError extends Error {
  code: number

  constructor(message: string, code = 400) {
    super(message)
    this.name = 'DataError'
    this.code = code
  }
}

export function avatarUrl(profilePic: string | null) {
  if (!profilePic) return null

  if (/^(https?:|data:|blob:|\/)/i.test(profilePic)) return profilePic

  return profilePic
}

export const imageUrl = avatarUrl

let idCounter = 0

function createId(prefix: string) {
  idCounter += 1

  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}`
}

function daysFromNow(days: number, hours = 0) {
  return new Date(Date.now() + days * 86_400_000 + hours * 3_600_000).toISOString()
}

function storedDate(daysAgo: number) {
  return daysFromNow(-daysAgo)
}

function seedStore(): Store {
  const users: StoredUser[] = [
    {
      UUID: 'user-admin',
      name: 'Ana Ribeiro',
      email: 'admin@infinity.gg',
      profilePic: null,
      role: 'ADMIN',
      password: 'admin123',
      createdAt: storedDate(240),
      updatedAt: storedDate(12),
    },
    {
      UUID: 'user-manager',
      name: 'Bruno Costa',
      email: 'manager@infinity.gg',
      profilePic: null,
      role: 'ADMIN',
      password: 'admin123',
      createdAt: storedDate(190),
      updatedAt: storedDate(30),
    },
    {
      UUID: 'user-user',
      name: 'Visitante',
      email: 'user@infinity.gg',
      profilePic: null,
      role: 'USER',
      password: 'user123',
      createdAt: storedDate(90),
      updatedAt: storedDate(90),
    },
    {
      UUID: 'user-frost',
      name: 'Lucas Ferreira',
      email: 'player@infinity.gg',
      profilePic: null,
      role: 'PLAYER',
      password: 'player123',
      createdAt: storedDate(180),
      updatedAt: storedDate(8),
    },
    {
      UUID: 'user-nyx',
      name: 'Marina Souza',
      email: 'marina@infinity.gg',
      profilePic: null,
      role: 'PLAYER',
      password: 'player123',
      createdAt: storedDate(170),
      updatedAt: storedDate(10),
    },
    {
      UUID: 'user-kaio',
      name: 'Kaio Almeida',
      email: 'kaio@infinity.gg',
      profilePic: null,
      role: 'PLAYER',
      password: 'player123',
      createdAt: storedDate(160),
      updatedAt: storedDate(9),
    },
    {
      UUID: 'user-lume',
      name: 'Beatriz Nunes',
      email: 'beatriz@infinity.gg',
      profilePic: null,
      role: 'PLAYER',
      password: 'player123',
      createdAt: storedDate(150),
      updatedAt: storedDate(15),
    },
    {
      UUID: 'user-ruckus',
      name: 'Rafael Lima',
      email: 'rafael@infinity.gg',
      profilePic: null,
      role: 'PLAYER',
      password: 'player123',
      createdAt: storedDate(140),
      updatedAt: storedDate(21),
    },
    {
      UUID: 'user-sable',
      name: 'Camila Rocha',
      email: 'camila@infinity.gg',
      profilePic: null,
      role: 'PLAYER',
      password: 'player123',
      createdAt: storedDate(130),
      updatedAt: storedDate(4),
    },
    {
      UUID: 'user-vortex',
      name: 'Diego Prado',
      email: 'diego@infinity.gg',
      profilePic: null,
      role: 'PLAYER',
      password: 'player123',
      createdAt: storedDate(120),
      updatedAt: storedDate(6),
    },
    {
      UUID: 'user-echo',
      name: 'Sofia Martins',
      email: 'sofia@infinity.gg',
      profilePic: null,
      role: 'PLAYER',
      password: 'player123',
      createdAt: storedDate(110),
      updatedAt: storedDate(3),
    },
  ]

  const games: StoredGame[] = [
    { id: 'brawl-stars', name: 'Brawl Stars' },
    { id: 'valorant', name: 'Valorant' },
    { id: 'league-of-legends', name: 'League of Legends' },
    { id: 'counter-strike-2', name: 'Counter-Strike 2' },
  ]

  const players: StoredPlayer[] = [
    {
      id: 'player-frost',
      nickname: 'frost',
      realName: 'Lucas Ferreira',
      country: 'Brasil',
      photo: null,
      userId: 'user-frost',
      createdAt: storedDate(175),
    },
    {
      id: 'player-nyx',
      nickname: 'nyx',
      realName: 'Marina Souza',
      country: 'Brasil',
      photo: null,
      userId: 'user-nyx',
      createdAt: storedDate(165),
    },
    {
      id: 'player-kaio',
      nickname: 'kaio',
      realName: 'Kaio Almeida',
      country: 'Brasil',
      photo: null,
      userId: 'user-kaio',
      createdAt: storedDate(155),
    },
    {
      id: 'player-lume',
      nickname: 'lume',
      realName: 'Beatriz Nunes',
      country: 'Brasil',
      photo: null,
      userId: 'user-lume',
      createdAt: storedDate(145),
    },
    {
      id: 'player-ruckus',
      nickname: 'ruckus',
      realName: 'Rafael Lima',
      country: 'Brasil',
      photo: null,
      userId: 'user-ruckus',
      createdAt: storedDate(135),
    },
    {
      id: 'player-sable',
      nickname: 'sable',
      realName: 'Camila Rocha',
      country: 'Brasil',
      photo: null,
      userId: 'user-sable',
      createdAt: storedDate(125),
    },
    {
      id: 'player-vortex',
      nickname: 'vortex',
      realName: 'Diego Prado',
      country: 'Brasil',
      photo: null,
      userId: 'user-vortex',
      createdAt: storedDate(115),
    },
    {
      id: 'player-echo',
      nickname: 'echo',
      realName: 'Sofia Martins',
      country: 'Portugal',
      photo: null,
      userId: 'user-echo',
      createdAt: storedDate(105),
    },
  ]

  const teams: StoredTeam[] = [
    {
      id: 'team-brawl-main',
      name: 'Infinity Brawl',
      tag: 'INF',
      logo: null,
      gameId: 'brawl-stars',
      createdAt: storedDate(170),
      playerIds: ['player-frost', 'player-lume', 'player-ruckus'],
    },
    {
      id: 'team-brawl-academy',
      name: 'Infinity Academy',
      tag: 'INF.A',
      logo: null,
      gameId: 'brawl-stars',
      createdAt: storedDate(150),
      playerIds: ['player-nyx', 'player-kaio'],
    },
    {
      id: 'team-valorant',
      name: 'Infinity Valorant',
      tag: 'INF.V',
      logo: null,
      gameId: 'valorant',
      createdAt: storedDate(140),
      playerIds: ['player-kaio', 'player-sable', 'player-echo'],
    },
    {
      id: 'team-valorant-rise',
      name: 'Infinity Rise',
      tag: 'RISE',
      logo: null,
      gameId: 'valorant',
      createdAt: storedDate(130),
      playerIds: ['player-nyx', 'player-lume'],
    },
    {
      id: 'team-lol',
      name: 'Infinity League',
      tag: 'INF.L',
      logo: null,
      gameId: 'league-of-legends',
      createdAt: storedDate(120),
      playerIds: ['player-vortex', 'player-echo'],
    },
    {
      id: 'team-cs',
      name: 'Infinity CS',
      tag: 'INF.CS',
      logo: null,
      gameId: 'counter-strike-2',
      createdAt: storedDate(110),
      playerIds: ['player-vortex', 'player-sable'],
    },
  ]

  const championships: StoredChampionship[] = [
    {
      id: 'championship-brawl-cup',
      name: 'Infinity Brawl Cup',
      gameId: 'brawl-stars',
      startDate: storedDate(25),
      endDate: daysFromNow(18),
      prizePool: 60_000,
      createdAt: storedDate(30),
    },
    {
      id: 'championship-brawl-masters',
      name: 'Brawl Stars Masters BR',
      gameId: 'brawl-stars',
      startDate: daysFromNow(10),
      endDate: daysFromNow(40),
      prizePool: 150_000,
      createdAt: storedDate(18),
    },
    {
      id: 'championship-valorant',
      name: 'Valorant Masters BR',
      gameId: 'valorant',
      startDate: storedDate(12),
      endDate: daysFromNow(26),
      prizePool: 120_000,
      createdAt: storedDate(20),
    },
    {
      id: 'championship-lol',
      name: 'CBLOL Academy',
      gameId: 'league-of-legends',
      startDate: daysFromNow(6),
      endDate: null,
      prizePool: 80_000,
      createdAt: storedDate(14),
    },
  ]

  const matches: StoredMatch[] = [
    {
      id: 'match-brawl-1',
      championshipId: 'championship-brawl-cup',
      scheduledAt: daysFromNow(-6),
      status: 'FINISHED',
      homeScore: 3,
      awayScore: 1,
      homeTeamId: 'team-brawl-main',
      awayTeamId: 'team-brawl-academy',
      homeTeamName: null,
      awayTeamName: null,
    },
    {
      id: 'match-brawl-2',
      championshipId: 'championship-brawl-cup',
      scheduledAt: daysFromNow(0, -2),
      status: 'LIVE',
      homeScore: 2,
      awayScore: 1,
      homeTeamId: 'team-brawl-main',
      awayTeamId: null,
      homeTeamName: null,
      awayTeamName: 'FURIA',
    },
    {
      id: 'match-brawl-3',
      championshipId: 'championship-brawl-cup',
      scheduledAt: daysFromNow(4),
      status: 'SCHEDULED',
      homeScore: null,
      awayScore: null,
      homeTeamId: 'team-brawl-academy',
      awayTeamId: null,
      homeTeamName: null,
      awayTeamName: 'LOUD',
    },
    {
      id: 'match-brawl-4',
      championshipId: 'championship-brawl-masters',
      scheduledAt: daysFromNow(12),
      status: 'SCHEDULED',
      homeScore: null,
      awayScore: null,
      homeTeamId: 'team-brawl-main',
      awayTeamId: null,
      homeTeamName: null,
      awayTeamName: 'paiN Gaming',
    },
    {
      id: 'match-brawl-5',
      championshipId: 'championship-brawl-masters',
      scheduledAt: daysFromNow(-2),
      status: 'FINISHED',
      homeScore: 2,
      awayScore: 3,
      homeTeamId: 'team-brawl-academy',
      awayTeamId: null,
      homeTeamName: null,
      awayTeamName: 'Sentinels',
    },
    {
      id: 'match-valorant-1',
      championshipId: 'championship-valorant',
      scheduledAt: daysFromNow(-3),
      status: 'FINISHED',
      homeScore: 2,
      awayScore: 0,
      homeTeamId: 'team-valorant',
      awayTeamId: 'team-valorant-rise',
      homeTeamName: null,
      awayTeamName: null,
    },
    {
      id: 'match-valorant-2',
      championshipId: 'championship-valorant',
      scheduledAt: daysFromNow(5),
      status: 'SCHEDULED',
      homeScore: null,
      awayScore: null,
      homeTeamId: 'team-valorant',
      awayTeamId: null,
      homeTeamName: null,
      awayTeamName: 'Sentinels',
    },
    {
      id: 'match-lol-1',
      championshipId: 'championship-lol',
      scheduledAt: daysFromNow(8),
      status: 'SCHEDULED',
      homeScore: null,
      awayScore: null,
      homeTeamId: 'team-lol',
      awayTeamId: null,
      homeTeamName: null,
      awayTeamName: 'paiN Gaming',
    },
  ]

  return {
    version: 1,
    users,
    games,
    players,
    teams,
    championships,
    matches,
  }
}

function readStore(): Store {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (raw) {
      const parsed = JSON.parse(raw) as Store

      if (parsed && parsed.version === 1 && Array.isArray(parsed.users)) return parsed
    }
  } catch {
    // Dados inválidos: recomeça com a base de demonstração.
  }

  const seeded = seedStore()
  writeStore(seeded)

  return seeded
}

function writeStore(store: Store) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // Sem espaço no localStorage: a sessão continua apenas em memória.
  }
}

function publicUser(user: StoredUser): User {
  return {
    UUID: user.UUID,
    name: user.name,
    email: user.email,
    profilePic: user.profilePic,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

function findGame(store: Store, id: string) {
  return store.games.find((game) => game.id === id) ?? null
}

function gameRelation(store: Store, gameId: string) {
  const game = findGame(store, gameId)

  return game ? { id: game.id, name: game.name } : { id: gameId, name: 'Jogo removido' }
}

function userRelation(store: Store, userId: string) {
  const user = store.users.find((item) => item.UUID === userId)

  return user
    ? { UUID: user.UUID, name: user.name, role: user.role }
    : { UUID: userId, name: 'Conta removida', role: 'USER' as const }
}

function teamView(store: Store, team: StoredTeam): Team {
  const playerMap = new Map(store.players.map((player) => [player.id, player]))

  return {
    id: team.id,
    name: team.name,
    tag: team.tag,
    logo: team.logo,
    gameId: team.gameId,
    createdAt: team.createdAt,
    game: gameRelation(store, team.gameId),
    players: team.playerIds.flatMap((playerId) => {
      const player = playerMap.get(playerId)

      if (!player) return []

      return [
        {
          id: player.id,
          nickname: player.nickname,
          country: player.country,
          photo: player.photo,
        },
      ]
    }),
  }
}

function playerView(store: Store, player: StoredPlayer): Player {
  return {
    id: player.id,
    nickname: player.nickname,
    realName: player.realName,
    country: player.country,
    photo: player.photo,
    userId: player.userId,
    createdAt: player.createdAt,
    user: userRelation(store, player.userId),
    teams: store.teams
      .filter((team) => team.playerIds.includes(player.id))
      .map((team) => ({
        id: team.id,
        name: team.name,
        tag: team.tag,
        logo: team.logo,
        game: gameRelation(store, team.gameId),
      })),
  }
}

function matchTeamView(store: Store, teamId: string | null, fallbackName: string | null) {
  if (teamId) {
    const team = store.teams.find((item) => item.id === teamId)

    if (team) {
      return {
        id: team.id,
        name: team.name,
        tag: team.tag,
        logo: team.logo,
        external: false,
      }
    }
  }

  return {
    id: null,
    name: fallbackName ?? 'A definir',
    tag: null,
    logo: null,
    external: true,
  }
}

function matchView(store: Store, match: StoredMatch): ChampionshipMatch {
  return {
    id: match.id,
    championshipId: match.championshipId,
    scheduledAt: match.scheduledAt,
    status: match.status,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    homeTeam: matchTeamView(store, match.homeTeamId, match.homeTeamName),
    awayTeam: matchTeamView(store, match.awayTeamId, match.awayTeamName),
  }
}

function championshipView(store: Store, championship: StoredChampionship): Championship {
  return {
    id: championship.id,
    name: championship.name,
    gameId: championship.gameId,
    startDate: championship.startDate,
    endDate: championship.endDate,
    prizePool: championship.prizePool,
    createdAt: championship.createdAt,
    game: gameRelation(store, championship.gameId),
    matches: store.matches
      .filter((match) => match.championshipId === championship.id)
      .map((match) => matchView(store, match)),
  }
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new DataError('Não foi possível ler a imagem.', 400))
    reader.readAsDataURL(file)
  })
}

async function shrinkImage(file: File) {
  const dataUrl = await readFileAsDataUrl(file)

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image()

      element.onload = () => resolve(element)
      element.onerror = () => reject(new Error('invalid image'))
      element.src = dataUrl
    })

    const maxSide = 512
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height))

    if (scale === 1 && file.size < 200 * 1024) return dataUrl

    const canvas = document.createElement('canvas')

    canvas.width = Math.max(1, Math.round(image.width * scale))
    canvas.height = Math.max(1, Math.round(image.height * scale))

    const context = canvas.getContext('2d')

    if (!context) return dataUrl

    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    return canvas.toDataURL('image/webp', 0.85)
  } catch {
    return dataUrl
  }
}

async function saveImage(file: File | null | undefined) {
  if (!(file instanceof File)) return null

  return shrinkImage(file)
}

function requireGame(store: Store, gameId: string) {
  const game = findGame(store, gameId)

  if (!game) throw new DataError('Jogo não encontrado.', 404)

  return game
}

function requireChampionship(store: Store, championshipId: string) {
  const championship = store.championships.find((item) => item.id === championshipId)

  if (!championship) throw new DataError('Campeonato não encontrado.', 404)

  return championship
}

function normalizeMatchInput(store: Store, input: MatchInput): Omit<StoredMatch, 'id'> {
  requireChampionship(store, input.championshipId)

  const homeTeamId = input.homeTeamId || null
  const awayTeamId = input.awayTeamId || null

  if (homeTeamId && !store.teams.some((team) => team.id === homeTeamId)) {
    throw new DataError('Time da casa não encontrado.', 404)
  }

  if (awayTeamId && !store.teams.some((team) => team.id === awayTeamId)) {
    throw new DataError('Time visitante não encontrado.', 404)
  }

  if (!homeTeamId && !input.homeTeamName) {
    throw new DataError('Informe o time da casa.', 400)
  }

  if (!awayTeamId && !input.awayTeamName) {
    throw new DataError('Informe o time visitante.', 400)
  }

  return {
    championshipId: input.championshipId,
    scheduledAt: input.scheduledAt,
    status: input.status,
    homeScore: input.status === 'SCHEDULED' ? null : input.homeScore,
    awayScore: input.status === 'SCHEDULED' ? null : input.awayScore,
    homeTeamId,
    awayTeamId,
    homeTeamName: homeTeamId ? null : (input.homeTeamName?.trim() ?? null),
    awayTeamName: awayTeamId ? null : (input.awayTeamName?.trim() ?? null),
  }
}

// --- Autenticação -----------------------------------------------------------

export async function login(email: string, password: string) {
  const store = readStore()
  const user = store.users.find(
    (item) => item.email.toLowerCase() === email.trim().toLowerCase(),
  )

  if (!user || user.password !== password) {
    throw new DataError('Email ou senha inválidos.', 401)
  }

  return publicUser(user)
}

// --- Usuários ---------------------------------------------------------------

export async function listUsers() {
  return readStore().users.map(publicUser)
}

export async function createUser(input: UserInput) {
  const store = readStore()
  const email = input.email.trim().toLowerCase()

  if (store.users.some((user) => user.email.toLowerCase() === email)) {
    throw new DataError('Já existe uma conta com este email.', 409)
  }

  if (!input.password) throw new DataError('Informe uma senha para a nova conta.', 400)

  const now = new Date().toISOString()
  const user: StoredUser = {
    UUID: createId('user'),
    name: input.name.trim(),
    email: input.email.trim(),
    role: input.role,
    password: input.password,
    profilePic: await saveImage(input.profilePic),
    createdAt: now,
    updatedAt: now,
  }

  store.users.push(user)
  writeStore(store)

  return publicUser(user)
}

export async function updateUser(UUID: string, input: UserInput) {
  const store = readStore()
  const user = store.users.find((item) => item.UUID === UUID)

  if (!user) throw new DataError('Usuário não encontrado.', 404)

  const email = input.email.trim().toLowerCase()

  if (
    store.users.some(
      (item) => item.UUID !== UUID && item.email.toLowerCase() === email,
    )
  ) {
    throw new DataError('Já existe uma conta com este email.', 409)
  }

  user.name = input.name.trim()
  user.email = input.email.trim()
  user.role = input.role
  user.updatedAt = new Date().toISOString()

  if (input.password) user.password = input.password

  const image = await saveImage(input.profilePic)

  if (image) user.profilePic = image

  writeStore(store)

  return publicUser(user)
}

export async function deleteUser(UUID: string) {
  const store = readStore()
  const playerIds = store.players
    .filter((player) => player.userId === UUID)
    .map((player) => player.id)

  store.users = store.users.filter((user) => user.UUID !== UUID)

  if (playerIds.length > 0) {
    store.players = store.players.filter((player) => !playerIds.includes(player.id))
    store.teams = store.teams.map((team) => ({
      ...team,
      playerIds: team.playerIds.filter((playerId) => !playerIds.includes(playerId)),
    }))
  }

  writeStore(store)
}

// --- Jogos ------------------------------------------------------------------

export async function listGames(): Promise<Game[]> {
  const store = readStore()

  return store.games.map((game) => ({
    id: game.id,
    name: game.name,
    teamsCount: store.teams.filter((team) => team.gameId === game.id).length,
  }))
}

function gameSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

export async function createGame(name: string) {
  const store = readStore()
  const trimmed = name.trim()

  if (store.games.some((game) => game.name.toLowerCase() === trimmed.toLowerCase())) {
    throw new DataError('Já existe um jogo com este nome.', 409)
  }

  const game: StoredGame = {
    id: gameSlug(trimmed) || createId('game'),
    name: trimmed,
  }

  store.games.push(game)
  writeStore(store)

  return { ...game, teamsCount: 0 }
}

export async function updateGame(id: string, name: string) {
  const store = readStore()
  const game = requireGame(store, id)
  const trimmed = name.trim()

  if (
    store.games.some(
      (item) => item.id !== id && item.name.toLowerCase() === trimmed.toLowerCase(),
    )
  ) {
    throw new DataError('Já existe um jogo com este nome.', 409)
  }

  game.name = trimmed
  writeStore(store)

  return { id: game.id, name: game.name }
}

export async function deleteGame(id: string) {
  const store = readStore()

  if (store.teams.some((team) => team.gameId === id)) {
    throw new DataError('Não é possível excluir um jogo com times cadastrados.', 409)
  }

  store.games = store.games.filter((game) => game.id !== id)
  store.championships = store.championships.filter(
    (championship) => championship.gameId !== id,
  )

  writeStore(store)
}

// --- Jogadores --------------------------------------------------------------

export async function listPlayers() {
  const store = readStore()

  return store.players.map((player) => playerView(store, player))
}

export async function getPlayer(id: string) {
  const store = readStore()
  const player = store.players.find((item) => item.id === id)

  if (!player) throw new DataError('Jogador não encontrado.', 404)

  return playerView(store, player)
}

export async function findPlayerByUser(userId: string): Promise<Player | null> {
  const store = readStore()
  const player = store.players.find((item) => item.userId === userId)

  return player ? playerView(store, player) : null
}

export async function createPlayer(input: PlayerInput) {
  const store = readStore()

  if (store.players.some((player) => player.userId === input.userId)) {
    throw new DataError('Esta conta já possui um jogador.', 409)
  }

  const player: StoredPlayer = {
    id: createId('player'),
    nickname: input.nickname.trim(),
    realName: input.realName.trim(),
    country: input.country.trim(),
    photo: await saveImage(input.photo),
    userId: input.userId,
    createdAt: new Date().toISOString(),
  }

  store.players.push(player)
  writeStore(store)

  return playerView(store, player)
}

export async function updatePlayer(id: string, input: PlayerInput) {
  const store = readStore()
  const player = store.players.find((item) => item.id === id)

  if (!player) throw new DataError('Jogador não encontrado.', 404)

  if (
    store.players.some(
      (item) => item.id !== id && item.userId === input.userId,
    )
  ) {
    throw new DataError('Esta conta já possui um jogador.', 409)
  }

  player.nickname = input.nickname.trim()
  player.realName = input.realName.trim()
  player.country = input.country.trim()
  player.userId = input.userId

  const image = await saveImage(input.photo)

  if (image) player.photo = image

  writeStore(store)

  return playerView(store, player)
}

export async function deletePlayer(id: string) {
  const store = readStore()

  store.players = store.players.filter((player) => player.id !== id)
  store.teams = store.teams.map((team) => ({
    ...team,
    playerIds: team.playerIds.filter((playerId) => playerId !== id),
  }))

  writeStore(store)
}

// --- Times ------------------------------------------------------------------

export async function listTeams() {
  const store = readStore()

  return store.teams.map((team) => teamView(store, team))
}

export async function getTeam(id: string) {
  const store = readStore()
  const team = store.teams.find((item) => item.id === id)

  if (!team) throw new DataError('Time não encontrado.', 404)

  return teamView(store, team)
}

export async function createTeam(input: TeamInput) {
  const store = readStore()

  requireGame(store, input.gameId)

  const team: StoredTeam = {
    id: createId('team'),
    name: input.name.trim(),
    tag: input.tag.trim().toUpperCase(),
    logo: await saveImage(input.logo),
    gameId: input.gameId,
    createdAt: new Date().toISOString(),
    playerIds: input.playerIds.filter((playerId) =>
      store.players.some((player) => player.id === playerId),
    ),
  }

  store.teams.push(team)
  writeStore(store)

  return teamView(store, team)
}

export async function updateTeam(id: string, input: TeamInput) {
  const store = readStore()
  const team = store.teams.find((item) => item.id === id)

  if (!team) throw new DataError('Time não encontrado.', 404)

  requireGame(store, input.gameId)

  team.name = input.name.trim()
  team.tag = input.tag.trim().toUpperCase()
  team.gameId = input.gameId
  team.playerIds = input.playerIds.filter((playerId) =>
    store.players.some((player) => player.id === playerId),
  )

  const image = await saveImage(input.logo)

  if (image) team.logo = image

  writeStore(store)

  return teamView(store, team)
}

export async function deleteTeam(id: string) {
  const store = readStore()

  store.teams = store.teams.filter((team) => team.id !== id)
  store.matches = store.matches.filter(
    (match) => match.homeTeamId !== id && match.awayTeamId !== id,
  )

  writeStore(store)
}

// --- Campeonatos ------------------------------------------------------------

export async function listChampionships(): Promise<Championship[]> {
  const store = readStore()

  return store.championships.map((championship) =>
    championshipView(store, championship),
  )
}

export async function listPlayerChampionships(userId: string): Promise<Championship[]> {
  const store = readStore()
  const player = store.players.find((item) => item.userId === userId)

  if (!player) return []

  const teamIds = store.teams
    .filter((team) => team.playerIds.includes(player.id))
    .map((team) => team.id)

  if (teamIds.length === 0) return []

  return store.championships
    .filter((championship) =>
      store.matches.some(
        (match) =>
          match.championshipId === championship.id &&
          ((match.homeTeamId && teamIds.includes(match.homeTeamId)) ||
            (match.awayTeamId && teamIds.includes(match.awayTeamId))),
      ),
    )
    .map((championship) => championshipView(store, championship))
}

export async function createChampionship(input: ChampionshipInput) {
  const store = readStore()

  requireGame(store, input.gameId)

  const championship: StoredChampionship = {
    id: createId('championship'),
    name: input.name.trim(),
    gameId: input.gameId,
    startDate: input.startDate,
    endDate: input.endDate,
    prizePool: input.prizePool,
    createdAt: new Date().toISOString(),
  }

  store.championships.push(championship)
  writeStore(store)

  return championshipView(store, championship)
}

export async function updateChampionship(id: string, input: ChampionshipInput) {
  const store = readStore()
  const championship = requireChampionship(store, id)

  requireGame(store, input.gameId)

  championship.name = input.name.trim()
  championship.gameId = input.gameId
  championship.startDate = input.startDate
  championship.endDate = input.endDate
  championship.prizePool = input.prizePool

  writeStore(store)

  return championshipView(store, championship)
}

export async function deleteChampionship(id: string) {
  const store = readStore()

  store.championships = store.championships.filter(
    (championship) => championship.id !== id,
  )
  store.matches = store.matches.filter((match) => match.championshipId !== id)

  writeStore(store)
}

// --- Partidas ---------------------------------------------------------------

export async function createMatch(input: MatchInput) {
  const store = readStore()
  const match: StoredMatch = {
    id: createId('match'),
    ...normalizeMatchInput(store, input),
  }

  store.matches.push(match)
  writeStore(store)

  return matchView(store, match)
}

export async function updateMatch(id: string, input: MatchInput) {
  const store = readStore()
  const match = store.matches.find((item) => item.id === id)

  if (!match) throw new DataError('Partida não encontrada.', 404)

  Object.assign(match, normalizeMatchInput(store, input))

  writeStore(store)

  return matchView(store, match)
}

export async function deleteMatch(id: string) {
  const store = readStore()

  store.matches = store.matches.filter((match) => match.id !== id)

  writeStore(store)
}

// --- Times externos ---------------------------------------------------------

export interface ExternalTeamSuggestion {
  name: string
  url: string | null
}

const externalTeams = [
  'FURIA',
  'LOUD',
  'paiN Gaming',
  'MIBR',
  'Fluxo',
  'Imperial',
  'Sharks',
  'RED Canids',
  'Sentinels',
  'NRG',
  'Team Liquid',
  'G2 Esports',
  'T1',
  'FaZe Clan',
  'Team Vitality',
  'NAVI',
  'SK Gaming',
  'Fnatic',
]

export async function searchExternalTeams(gameId: string, query: string) {
  void gameId

  const term = query.trim().toLowerCase()
  const teams = externalTeams
    .filter((name) => name.toLowerCase().includes(term))
    .slice(0, 10)
    .map((name) => ({ name, url: null }))

  return { teams, supported: true }
}
