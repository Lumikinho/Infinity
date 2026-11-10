import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { Avatar } from './Avatar'
import { AsciiWordmark } from './AsciiWordmark'
import { IconLogout, IconPencil } from './Icons'
import { Notice } from './Notice'
import { PlayerTeams } from './PlayerTeams'
import type { TeamsState } from './PlayerTeams'
import { ProfileDialog } from './ProfileDialog'
import { avatarUrl, deleteUser, findPlayerByUser, updateUser } from '../lib/localData'
import { cn, roleLabels } from '../lib/format'
import {
  managementNav,
  playerNav,
  screenHashes,
  screenLabels,
} from '../lib/routes'
import type { AppScreen } from '../lib/routes'
import { iconButtonClass } from '../lib/styles'
import { useNotice } from '../lib/useNotice'
import type { PlayerTeam, User, UserInput } from '../types'

interface AppShellProps {
  user: User
  current: AppScreen
  onLogout: () => void
  onSessionUserChange: (user: User) => void
  children: ReactNode
}

function navLinkClass(active: boolean) {
  return cn(
    'flex min-h-11 shrink-0 items-center rounded-full px-3 font-display text-[13px] font-semibold uppercase tracking-[0.06em] transition',
    active
      ? 'bg-accent text-canvas'
      : 'text-muted hover:bg-white/5 hover:text-ink',
  )
}

export function AppShell({
  user,
  current,
  onLogout,
  onSessionUserChange,
  children,
}: AppShellProps) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [notice, setNotice] = useNotice()
  const [playerTeams, setPlayerTeams] = useState<PlayerTeam[]>([])
  const [teamsState, setTeamsState] = useState<TeamsState>('loading')
  const [teamsReloadToken, setTeamsReloadToken] = useState(0)

  const isPlayer = user.role === 'PLAYER'
  const navItems = isPlayer ? playerNav : managementNav
  const sectionLabel = isPlayer ? 'Jogador' : 'Gerenciamento'

  useEffect(() => {
    if (!isPlayer) return

    let active = true

    setTeamsState('loading')

    findPlayerByUser(user.UUID)
      .then((player) => {
        if (!active) return

        setPlayerTeams(player?.teams ?? [])
        setTeamsState('ready')
      })
      .catch(() => {
        if (!active) return

        setTeamsState('error')
      })

    return () => {
      active = false
    }
  }, [isPlayer, user.UUID, teamsReloadToken])

  async function handleProfileSave(input: UserInput) {
    const updated = await updateUser(user.UUID, input)

    onSessionUserChange(updated)
    setNotice('Sua conta foi atualizada.')
  }

  async function handleProfileDelete() {
    await deleteUser(user.UUID)
    onLogout()
  }

  return (
    <div className="min-h-dvh bg-canvas md:pl-60">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-line bg-black md:flex">
        <div className="border-b border-line px-5 py-6">
          <a
            href={screenHashes[isPlayer ? 'player' : 'users']}
            aria-label={isPlayer ? 'Infinity - painel do jogador' : 'Infinity - painel administrativo'}
            className="flex flex-col items-start gap-2.5"
          >
            <AsciiWordmark className="ascii-wordmark-compact" />
            <div>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
                {isPlayer ? 'Área do jogador' : 'Painel'}
              </p>
            </div>
          </a>
        </div>

        <nav aria-label="Seções" className="flex-1 px-3">
          <p className="px-2 text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
            {sectionLabel}
          </p>

          <div className="mt-3 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.screen}
                href={screenHashes[item.screen]}
                aria-current={current === item.screen ? 'page' : undefined}
                className={cn(navLinkClass(current === item.screen), 'w-full')}
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        {isPlayer && (
          <PlayerTeams
            teams={playerTeams}
            state={teamsState}
            onRetry={() => setTeamsReloadToken((current) => current + 1)}
            className="max-h-64 overflow-y-auto border-t border-line px-3 py-3"
          />
        )}

        <div className="border-t border-line bg-black/60 p-3">
          <a
            href={screenHashes.home}
            className="flex min-h-11 w-full items-center gap-2 rounded-full px-3 font-display text-[13px] font-semibold uppercase tracking-[0.06em] text-muted transition hover:bg-white/5 hover:text-ink"
          >
            Ver site público
          </a>

          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            aria-label="Abrir minha conta"
            className="flex min-h-11 w-full items-center gap-2.5 rounded-full px-2 py-2 text-left transition hover:bg-neutral-100"
          >
            <Avatar name={user.name} src={avatarUrl(user.profilePic)} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium">{user.name}</span>
              <span className="mt-0.5 block truncate text-[11px] text-muted">
                {roleLabels[user.role]}
              </span>
            </span>
            <IconPencil className="size-3.5 shrink-0 text-muted" />
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="mt-1 flex min-h-11 w-full items-center gap-2 rounded-full px-3 font-display text-[13px] font-semibold uppercase tracking-[0.06em] text-muted transition hover:bg-white/5 hover:text-ink"
          >
            <IconLogout className="size-4" />
            Sair
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-10 border-b border-line bg-canvas/90 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <AsciiWordmark className="ascii-wordmark-compact shrink-0" />
            <span className="truncate border-l border-line pl-3 font-display text-sm font-semibold uppercase tracking-[0.06em] text-muted">
              {screenLabels[current]}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              aria-label="Abrir minha conta"
              className="flex min-h-11 items-center gap-2 rounded-full px-1.5 transition hover:bg-neutral-100"
            >
              <Avatar name={user.name} src={avatarUrl(user.profilePic)} size="sm" />
              <span className="hidden text-[11px] text-muted sm:block">
                {roleLabels[user.role]}
              </span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              aria-label="Sair da conta"
              className={`${iconButtonClass} rounded-full`}
            >
              <IconLogout className="size-4" />
            </button>
          </div>
        </div>

        <nav aria-label="Seções" className="overflow-x-auto border-t border-line px-2 py-1.5">
          <div className="flex gap-1">
            {navItems.map((item) => (
              <a
                key={item.screen}
                href={screenHashes[item.screen]}
                aria-current={current === item.screen ? 'page' : undefined}
                className={cn(navLinkClass(current === item.screen), 'px-3')}
              >
                {item.label}
              </a>
            ))}

            <a href={screenHashes.home} className={cn(navLinkClass(false), 'px-3')}>
              Site
            </a>
          </div>
        </nav>

        {isPlayer && (
          <PlayerTeams
            teams={playerTeams}
            state={teamsState}
            onRetry={() => setTeamsReloadToken((current) => current + 1)}
            className="border-t border-line px-4 py-2.5"
          />
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <Notice message={notice} className="mb-5" />
        {children}
      </main>

      {profileOpen && (
        <ProfileDialog
          user={user}
          onClose={() => setProfileOpen(false)}
          onSubmit={handleProfileSave}
          onDelete={handleProfileDelete}
        />
      )}
    </div>
  )
}
