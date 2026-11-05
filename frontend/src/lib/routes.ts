export type AppScreen =
  | 'home'
  | 'login'
  | 'users'
  | 'managePlayers'
  | 'manageTeams'
  | 'manageGames'
  | 'championships'
  | 'player'
  | 'games'
  | 'gameDetail'
  | 'players'
  | 'playerDetail'

export interface AppRoute {
  screen: AppScreen
  id?: string
}

export const screenHashes: Record<AppScreen, string> = {
  home: '#/',
  login: '#/entrar',
  users: '#/usuarios',
  managePlayers: '#/gerenciar/jogadores',
  manageTeams: '#/gerenciar/times',
  manageGames: '#/gerenciar/jogos',
  championships: '#/campeonatos',
  player: '#/jogador',
  games: '#/jogos',
  gameDetail: '#/jogos',
  players: '#/jogadores',
  playerDetail: '#/jogadores',
}

export const screenLabels: Record<AppScreen, string> = {
  home: 'Início',
  login: 'Entrar',
  users: 'Usuários',
  managePlayers: 'Jogadores',
  manageTeams: 'Times',
  manageGames: 'Jogos',
  championships: 'Campeonatos',
  player: 'Meu espaço',
  games: 'Jogos',
  gameDetail: 'Jogo',
  players: 'Jogadores',
  playerDetail: 'Jogador',
}

const screensByHash: Record<string, AppScreen> = {
  inicio: 'home',
  entrar: 'login',
  cadastro: 'login',
  usuarios: 'users',
  campeonatos: 'championships',
  jogador: 'player',
}

function decodeSegment(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function gameSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

export function readRoute(): AppRoute {
  const hash = window.location.hash
    .replace(/^#\/?/, '')
    .replace(/\/+$/, '')

  if (!hash) return { screen: 'home' }

  const [segment, id] = hash.split('/')

  if (segment === 'gerenciar') {
    if (id === 'jogadores') return { screen: 'managePlayers' }
    if (id === 'times') return { screen: 'manageTeams' }
    if (id === 'jogos') return { screen: 'manageGames' }

    return { screen: 'users' }
  }

  if (segment === 'jogos') {
    return id ? { screen: 'gameDetail', id: decodeSegment(id) } : { screen: 'games' }
  }

  if (segment === 'jogadores') {
    return id ? { screen: 'playerDetail', id: decodeSegment(id) } : { screen: 'players' }
  }

  // Link antigo do site: leva para a página do jogo correspondente.
  if (segment === 'brawl-stars' || segment === 'brawlstars') {
    return { screen: 'gameDetail', id: 'brawl-stars' }
  }

  return { screen: screensByHash[segment] ?? 'home' }
}

export function routeHash(screen: AppScreen, id?: string) {
  if (screen === 'gameDetail' && id) return `#/jogos/${encodeURIComponent(id)}`
  if (screen === 'playerDetail' && id) return `#/jogadores/${encodeURIComponent(id)}`

  return screenHashes[screen]
}

export function gameHref(id: string) {
  return `#/jogos/${encodeURIComponent(id)}`
}

export function playerHref(id: string) {
  return `#/jogadores/${encodeURIComponent(id)}`
}

export function isPublicScreen(screen: AppScreen) {
  return (
    screen === 'home' ||
    screen === 'games' ||
    screen === 'gameDetail' ||
    screen === 'players' ||
    screen === 'playerDetail'
  )
}

export interface NavItem {
  screen: AppScreen
  label: string
}

export const publicNav: NavItem[] = [
  { screen: 'home', label: 'Início' },
  { screen: 'games', label: 'Jogos' },
]

export const managementNav: NavItem[] = [
  { screen: 'users', label: 'Usuários' },
  { screen: 'managePlayers', label: 'Jogadores' },
  { screen: 'manageTeams', label: 'Times' },
  { screen: 'manageGames', label: 'Jogos' },
  { screen: 'championships', label: 'Campeonatos' },
]

export const playerNav: NavItem[] = [{ screen: 'player', label: 'Meu espaço' }]
