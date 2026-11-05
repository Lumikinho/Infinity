import { useEffect, useState } from 'react'

import { AppShell } from './components/AppShell'
import { PublicShell } from './components/PublicShell'
import { clearSession, readSession, writeSession } from './lib/session'
import { isPublicScreen, readRoute, routeHash } from './lib/routes'
import type { AppRoute } from './lib/routes'
import { ChampionshipsPage } from './pages/ChampionshipsPage'
import { GamePage } from './pages/GamePage'
import { GamesPage } from './pages/GamesPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { PlayerHomePage } from './pages/PlayerHomePage'
import { PlayersPage } from './pages/PlayersPage'
import { PublicGamesPage } from './pages/PublicGamesPage'
import { PublicPlayerPage } from './pages/PublicPlayerPage'
import { PublicPlayersPage } from './pages/PublicPlayersPage'
import { TeamsPage } from './pages/TeamsPage'
import { UsersPage } from './pages/UsersPage'
import type { User } from './types'

function resolveRoute(user: User | null, route: AppRoute): AppRoute {
  if (route.screen === 'login') {
    if (!user) return route

    return { screen: user.role === 'PLAYER' ? 'player' : 'users' }
  }

  if (isPublicScreen(route.screen)) return route

  if (!user) return { screen: 'login' }

  if (user.role === 'PLAYER') {
    return route.screen === 'player' ? route : { screen: 'player' }
  }

  if (route.screen === 'player') return { screen: 'users' }

  return route
}

function App() {
  const [sessionUser, setSessionUser] = useState<User | null>(() => readSession())
  const [route, setRoute] = useState<AppRoute>(() => readRoute())

  useEffect(() => {
    const handleHashChange = () => setRoute(readRoute())

    window.addEventListener('hashchange', handleHashChange)

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const current = resolveRoute(sessionUser, route)

  useEffect(() => {
    const expected = routeHash(current.screen, current.id)

    if (window.location.hash !== expected) window.location.hash = expected
  }, [route, current.screen, current.id])

  function handleAuthenticated(user: User) {
    writeSession(user)
    setSessionUser(user)
    setRoute({ screen: user.role === 'PLAYER' ? 'player' : 'users' })
  }

  function handleLogout() {
    clearSession()
    setSessionUser(null)
    setRoute({ screen: 'home' })
  }

  function handleSessionUserChange(user: User) {
    writeSession(user)
    setSessionUser(user)
  }

  if (current.screen === 'login') {
    return <LoginPage onAuthenticated={handleAuthenticated} />
  }

  if (isPublicScreen(current.screen)) {
    return (
      <PublicShell current={current.screen} user={sessionUser}>
        {current.screen === 'home' && <HomePage />}
        {current.screen === 'games' && <PublicGamesPage />}
        {current.screen === 'gameDetail' && current.id && (
          <GamePage identifier={current.id} />
        )}
        {current.screen === 'players' && <PublicPlayersPage />}
        {current.screen === 'playerDetail' && current.id && (
          <PublicPlayerPage playerId={current.id} />
        )}
      </PublicShell>
    )
  }

  if (!sessionUser) return null

  return (
    <AppShell
      user={sessionUser}
      current={current.screen}
      onLogout={handleLogout}
      onSessionUserChange={handleSessionUserChange}
    >
      {current.screen === 'users' && <UsersPage user={sessionUser} />}
      {current.screen === 'managePlayers' && <PlayersPage />}
      {current.screen === 'manageTeams' && <TeamsPage />}
      {current.screen === 'manageGames' && <GamesPage />}
      {current.screen === 'championships' && <ChampionshipsPage />}
      {current.screen === 'player' && <PlayerHomePage user={sessionUser} />}
    </AppShell>
  )
}

export default App
