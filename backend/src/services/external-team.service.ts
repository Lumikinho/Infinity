const USER_AGENT = 'InfinityApp/1.0 (contact: dev@infinity.app)'
const MIN_INTERVAL_MS = 2000
const CACHE_TTL_MS = 5 * 60 * 1000
const CACHE_LIMIT = 100
const SEARCH_LIMIT = 10

export interface ExternalTeamSuggestion {
  name: string
  url: string | null
}

const wikiByGame: Record<string, string> = {
  brawlstars: 'brawlstars',
  brawl: 'brawlstars',
  counterstrike: 'counterstrike',
  counterstrike2: 'counterstrike',
  cs: 'counterstrike',
  cs2: 'counterstrike',
  csgo: 'counterstrike',
  leagueoflegends: 'leagueoflegends',
  lol: 'leagueoflegends',
  valorant: 'valorant',
  dota: 'dota2',
  dota2: 'dota2',
  rocketleague: 'rocketleague',
  overwatch: 'overwatch',
  overwatch2: 'overwatch',
  callofduty: 'callofduty',
  cod: 'callofduty',
  freefire: 'freefire',
  rainbow6: 'rainbow6',
  rainbow6siege: 'rainbow6',
  r6: 'rainbow6',
  apexlegends: 'apexlegends',
  apex: 'apexlegends',
  fortnite: 'fortnite',
  pubg: 'pubg',
  mobilelegends: 'mobilelegends',
  mobilelegendsbangbang: 'mobilelegends',
  clashroyale: 'clashroyale',
  clashofclans: 'clashofclans',
  eafc: 'eafc',
  fifa: 'fifa',
  starcraft: 'starcraft2',
  starcraft2: 'starcraft2',
  ageofempires: 'ageofempires',
  tekken: 'tekken',
  tekken8: 'tekken',
  streetfighter: 'streetfighter',
  streetfighter6: 'streetfighter',
  smash: 'smash',
  supersmashbros: 'smash',
  honorofkings: 'honorofkings',
  wildrift: 'wildrift',
  leagueoflegendswildrift: 'wildrift',
  tft: 'tft',
  teamfighttactics: 'tft',
  hearthstone: 'hearthstone',
  deadlock: 'deadlock',
  marvelrivals: 'marvelrivals',
  rust: 'rust',
}

const prefixKeys = Object.keys(wikiByGame).sort((a, b) => b.length - a.length)

export function wikiForGame(gameName: string) {
  const key = gameName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')

  if (wikiByGame[key]) return wikiByGame[key]

  const prefix = prefixKeys.find((candidate) => key.startsWith(candidate))

  return prefix ? wikiByGame[prefix] : null
}

let requestChain: Promise<unknown> = Promise.resolve()
let lastRequestAt = 0

function scheduleRequest<T>(task: () => Promise<T>): Promise<T> {
  const run = requestChain.then(async () => {
    const wait = MIN_INTERVAL_MS - (Date.now() - lastRequestAt)

    if (wait > 0) {
      await new Promise((resolve) => setTimeout(resolve, wait))
    }

    lastRequestAt = Date.now()

    return task()
  })

  requestChain = run.catch(() => undefined)

  return run
}

const cache = new Map<string, { expiresAt: number; teams: ExternalTeamSuggestion[] }>()

export async function searchExternalTeams(wiki: string, query: string) {
  const key = `${wiki}:${query.toLowerCase()}`
  const cached = cache.get(key)

  if (cached && cached.expiresAt > Date.now()) {
    return cached.teams
  }

  const teams = await scheduleRequest(async () => {
    const url = `https://liquipedia.net/${encodeURIComponent(
      wiki,
    )}/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=${SEARCH_LIMIT}&format=json`

    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      throw new Error(`Liquipedia respondeu ${response.status}`)
    }

    const payload = (await response.json()) as [string, string[], string[], string[]]
    const [, titles = [], , urls = []] = payload

    return titles
      .map((title, index) => ({
        name: title,
        url: urls[index] ?? null,
      }))
      .filter((item) => item.name && !item.name.includes('/'))
      .slice(0, 8)
  })

  if (cache.size >= CACHE_LIMIT) cache.clear()

  cache.set(key, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    teams,
  })

  return teams
}
