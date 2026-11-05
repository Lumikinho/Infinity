import { useCallback, useEffect, useState } from 'react'

import { ConfirmDialog } from '../components/ConfirmDialog'
import { IconPencil, IconPlus, IconRefresh, IconTrash } from '../components/Icons'
import { LoadError } from '../components/LoadError'
import { LoadingList } from '../components/LoadingList'
import { Notice } from '../components/Notice'
import { PageHeader } from '../components/PageHeader'
import { TeamFormDialog } from '../components/TeamFormDialog'
import { TeamLogo } from '../components/TeamLogo'
import {
  avatarUrl,
  createTeam,
  deleteTeam,
  listGames,
  listPlayers,
  listTeams,
  updateTeam,
} from '../lib/api'
import { cn, formatDateTime } from '../lib/format'
import { iconButtonClass, primaryButtonClass, secondaryButtonClass } from '../lib/styles'
import { useNotice } from '../lib/useNotice'
import type { Game, Player, Team, TeamInput } from '../types'

type FormState = { mode: 'create' } | { mode: 'edit'; team: Team } | null
type LoadState = 'loading' | 'ready' | 'error'

function sortByNewest(list: Team[]) {
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [form, setForm] = useState<FormState>(null)
  const [deleting, setDeleting] = useState<Team | null>(null)
  const [notice, setNotice] = useNotice()

  const load = useCallback(async (mode: 'initial' | 'refresh') => {
    if (mode === 'initial') setLoadState('loading')
    else setRefreshing(true)

    setError(null)

    try {
      const [teamList, gameList, playerList] = await Promise.all([
        listTeams(),
        listGames(),
        listPlayers(),
      ])

      setTeams(sortByNewest(teamList))
      setGames(gameList)
      setPlayers(playerList)
      setLoadState('ready')
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Erro ao carregar times.'

      setError(message)
      setLoadState((current) => (current === 'ready' ? 'ready' : 'error'))
    } finally {
      if (mode === 'refresh') setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void load('initial')
  }, [load])

  async function handleSave(input: TeamInput) {
    if (form?.mode === 'edit') {
      const updated = await updateTeam(form.team.id, input)

      setTeams((previous) =>
        sortByNewest(previous.map((item) => (item.id === updated.id ? updated : item))),
      )
      setNotice(`${updated.name} foi atualizado.`)

      return
    }

    const created = await createTeam(input)

    setTeams((previous) => sortByNewest([created, ...previous]))
    setNotice(`${created.name} foi cadastrado.`)
  }

  async function handleDelete() {
    if (!deleting) return

    await deleteTeam(deleting.id)
    setTeams((previous) => previous.filter((item) => item.id !== deleting.id))
    setNotice(`${deleting.name} foi removido.`)
  }

  const canCreate = loadState === 'ready' && games.length > 0

  const description =
    loadState === 'ready' && teams.length > 0
      ? `${teams.length} ${teams.length === 1 ? 'time cadastrado' : 'times cadastrados'}.`
      : 'Times vinculados a jogos e jogadores.'

  return (
    <>
      <PageHeader title="Times" description={description}>
        <button
          type="button"
          onClick={() => void load('refresh')}
          disabled={refreshing || loadState === 'loading'}
          className={secondaryButtonClass}
        >
          <IconRefresh className={cn('size-4', refreshing && 'animate-spin')} />
          <span className="hidden sm:inline">{refreshing ? 'Atualizando' : 'Atualizar'}</span>
          <span className="sr-only sm:hidden">Atualizar lista</span>
        </button>

        <button
          type="button"
          onClick={() => setForm({ mode: 'create' })}
          disabled={!canCreate}
          title={loadState === 'ready' && games.length === 0 ? 'Cadastre um jogo primeiro' : undefined}
          className={primaryButtonClass}
        >
          <IconPlus className="size-4" />
          Adicionar time
        </button>
      </PageHeader>

      <Notice message={notice} className="mt-4" />

      {loadState === 'ready' && games.length === 0 && (
        <p className="mt-4 border border-line bg-surface px-3 py-2 text-[13px] text-muted">
          Nenhum jogo cadastrado.{' '}
          <a
            href="#/jogos"
            className="font-medium text-ink underline decoration-line-strong underline-offset-4 transition hover:decoration-accent"
          >
            Cadastre um jogo
          </a>{' '}
          antes de criar times.
        </p>
      )}

      {error && loadState === 'ready' && (
        <p
          role="status"
          className="mt-4 border border-line bg-surface px-3 py-2 text-[13px] text-muted"
        >
          A lista pode estar desatualizada: {error}
        </p>
      )}

      {loadState === 'loading' && (
        <>
          <LoadingList />
          <p role="status" className="sr-only">
            Carregando times
          </p>
        </>
      )}

      {loadState === 'error' && (
        <LoadError message={error ?? 'Erro ao carregar times.'} onRetry={() => void load('initial')} />
      )}

      {loadState === 'ready' && teams.length === 0 && (
        <div className="mt-6 rounded-lg border border-dashed border-neutral-300 bg-surface px-6 py-16 text-center">
          <h2 className="text-base font-semibold">Nenhum time cadastrado</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted">
            Monte um time vinculado a um jogo e escolha os jogadores do elenco.
          </p>
          <button
            type="button"
            onClick={() => setForm({ mode: 'create' })}
            disabled={!canCreate}
            className={cn(primaryButtonClass, 'mt-6')}
          >
            <IconPlus className="size-4" />
            Adicionar time
          </button>
        </div>
      )}

      {loadState === 'ready' && teams.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg border border-line bg-surface">
          <div className="hidden overflow-x-auto xl:block">
            <table className="w-full min-w-[56rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-neutral-50 text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
                  <th scope="col" className="px-4 py-3">
                    Time
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Jogo
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Jogadores
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Criado em
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {teams.map((item) => {
                  const names = item.players.map((player) => player.nickname).join(', ')

                  return (
                    <tr key={item.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <TeamLogo name={item.name} src={avatarUrl(item.logo)} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{item.name}</p>
                            <p className="truncate text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
                              {item.tag}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-[13px] text-muted">{item.game.name}</td>

                      <td className="px-4 py-3">
                        {item.players.length === 0 ? (
                          <span className="text-[13px] text-muted">Sem jogadores</span>
                        ) : (
                          <div className="max-w-56">
                            <p className="text-[13px]">
                              {item.players.length}{' '}
                              {item.players.length === 1 ? 'jogador' : 'jogadores'}
                            </p>
                            <p className="truncate text-[11px] text-muted" title={names}>
                              {names}
                            </p>
                          </div>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-[13px] tabular-nums text-muted">
                        {formatDateTime(item.createdAt)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setForm({ mode: 'edit', team: item })}
                            aria-label={`Editar ${item.name}`}
                            title="Editar"
                            className={iconButtonClass}
                          >
                            <IconPencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(item)}
                            aria-label={`Excluir ${item.name}`}
                            title="Excluir"
                            className={iconButtonClass}
                          >
                            <IconTrash className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-line xl:hidden">
            {teams.map((item) => {
              const names = item.players.map((player) => player.nickname).join(', ')

              return (
                <li key={item.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <TeamLogo name={item.name} src={avatarUrl(item.logo)} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="truncate text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
                          {item.tag}
                        </p>
                      </div>
                    </div>
                    <span className="inline-block max-w-40 shrink-0 truncate rounded border border-line bg-neutral-50 px-1.5 py-0.5 text-[11px]">
                      {item.game.name}
                    </span>
                  </div>

                  <div className="mt-3 rounded border border-line bg-neutral-50 px-2.5 py-2">
                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
                      Jogadores
                    </p>
                    <p className="mt-1 text-[13px]">
                      {item.players.length === 0
                        ? 'Sem jogadores'
                        : `${item.players.length} ${item.players.length === 1 ? 'jogador' : 'jogadores'}`}
                    </p>
                    {names && <p className="mt-0.5 truncate text-[11px] text-muted">{names}</p>}
                  </div>

                  <p className="mt-2 text-[11px] tabular-nums text-muted">
                    Criado em {formatDateTime(item.createdAt)}
                  </p>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ mode: 'edit', team: item })}
                      className={cn(secondaryButtonClass, 'flex-1')}
                    >
                      <IconPencil className="size-4" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(item)}
                      className={cn(secondaryButtonClass, 'flex-1')}
                    >
                      <IconTrash className="size-4" />
                      Excluir
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {form && (
        <TeamFormDialog
          team={form.mode === 'edit' ? form.team : null}
          games={games}
          players={players}
          onClose={() => setForm(null)}
          onSubmit={handleSave}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Excluir time?"
          description={
            <>
              O time <span className="font-medium text-ink">{deleting.name}</span> será removido. Os
              vínculos com jogadores são desfeitos e as partidas vinculadas também são removidas,
              mas os jogadores continuam cadastrados.
            </>
          }
          confirmLabel="Excluir time"
          errorFallback="Não foi possível excluir o time."
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  )
}
