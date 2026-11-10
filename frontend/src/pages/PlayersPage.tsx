import { useCallback, useEffect, useState } from 'react'

import { Avatar } from '../components/Avatar'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { IconPencil, IconPlus, IconRefresh, IconTrash } from '../components/Icons'
import { LoadError } from '../components/LoadError'
import { LoadingList } from '../components/LoadingList'
import { Notice } from '../components/Notice'
import { PageHeader } from '../components/PageHeader'
import { PlayerFormDialog } from '../components/PlayerFormDialog'
import {
  avatarUrl,
  createPlayer,
  deletePlayer,
  listPlayers,
  listUsers,
  updatePlayer,
} from '../lib/localData'
import { cn, formatDateTime, roleLabels } from '../lib/format'
import { iconButtonClass, primaryButtonClass, secondaryButtonClass } from '../lib/styles'
import { useNotice } from '../lib/useNotice'
import type { Player, PlayerInput, User } from '../types'

type FormState = { mode: 'create' } | { mode: 'edit'; player: Player } | null
type LoadState = 'loading' | 'ready' | 'error'

function sortByNewest(list: Player[]) {
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

function sortUsers(list: User[]) {
  return [...list].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
}

export function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [form, setForm] = useState<FormState>(null)
  const [deleting, setDeleting] = useState<Player | null>(null)
  const [notice, setNotice] = useNotice()

  const load = useCallback(async (mode: 'initial' | 'refresh') => {
    if (mode === 'initial') setLoadState('loading')
    else setRefreshing(true)

    setError(null)

    try {
      const [playerList, userList] = await Promise.all([listPlayers(), listUsers()])

      setPlayers(sortByNewest(playerList))
      setUsers(sortUsers(userList))
      setLoadState('ready')
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Erro ao carregar jogadores.'

      setError(message)
      setLoadState((current) => (current === 'ready' ? 'ready' : 'error'))
    } finally {
      if (mode === 'refresh') setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void load('initial')
  }, [load])

  async function handleSave(input: PlayerInput) {
    if (form?.mode === 'edit') {
      const updated = await updatePlayer(form.player.id, input)

      setPlayers((previous) =>
        sortByNewest(previous.map((item) => (item.id === updated.id ? updated : item))),
      )
      setNotice(`${updated.nickname} foi atualizado.`)

      return
    }

    const created = await createPlayer(input)

    setPlayers((previous) => sortByNewest([created, ...previous]))
    setNotice(`${created.nickname} foi cadastrado.`)
  }

  async function handleDelete() {
    if (!deleting) return

    await deletePlayer(deleting.id)
    setPlayers((previous) => previous.filter((item) => item.id !== deleting.id))
    setNotice(`${deleting.nickname} foi removido.`)
  }

  const linkedUserIds = new Set(players.map((player) => player.userId))
  const availableUsers = users.filter((user) => !linkedUserIds.has(user.UUID))
  const canCreate = loadState === 'ready' && availableUsers.length > 0

  const description =
    loadState === 'ready' && players.length > 0
      ? `${players.length} ${players.length === 1 ? 'jogador cadastrado' : 'jogadores cadastrados'}.`
      : 'Perfis de jogadores cadastrados.'

  return (
    <>
      <PageHeader title="Jogadores" description={description}>
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
          title={
            loadState === 'ready' && availableUsers.length === 0
              ? 'Todas as contas já têm um jogador'
              : undefined
          }
          className={primaryButtonClass}
        >
          <IconPlus className="size-4" />
          Adicionar jogador
        </button>
      </PageHeader>

      <Notice message={notice} className="mt-4" />

      {loadState === 'ready' && availableUsers.length === 0 && (
        <p className="mt-4 border border-line bg-surface px-3 py-2 text-[13px] text-muted">
          {users.length === 0 ? (
            <>
              Nenhuma conta cadastrada.{' '}
              <a
                href="#/usuarios"
                className="font-medium text-ink underline decoration-line-strong underline-offset-4 transition hover:decoration-accent"
              >
                Cadastre um usuário
              </a>{' '}
              primeiro.
            </>
          ) : (
            <>
              Todas as contas já têm um jogador. Cadastre outra conta em{' '}
              <a
                href="#/usuarios"
                className="font-medium text-ink underline decoration-line-strong underline-offset-4 transition hover:decoration-accent"
              >
                Usuários
              </a>
              .
            </>
          )}
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
            Carregando jogadores
          </p>
        </>
      )}

      {loadState === 'error' && (
        <LoadError message={error ?? 'Erro ao carregar jogadores.'} onRetry={() => void load('initial')} />
      )}

      {loadState === 'ready' && players.length === 0 && (
        <div className="mt-6 rounded-lg border border-dashed border-neutral-300 bg-surface px-6 py-16 text-center">
          <h2 className="text-base font-semibold">Nenhum jogador cadastrado</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted">
            Crie um perfil de jogador a partir de uma conta existente.
          </p>
          <button
            type="button"
            onClick={() => setForm({ mode: 'create' })}
            disabled={!canCreate}
            className={cn(primaryButtonClass, 'mt-6')}
          >
            <IconPlus className="size-4" />
            Adicionar jogador
          </button>
        </div>
      )}

      {loadState === 'ready' && players.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg border border-line bg-surface">
          <div className="hidden overflow-x-auto xl:block">
            <table className="w-full min-w-[60rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-neutral-50 text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
                  <th scope="col" className="px-4 py-3">
                    Jogador
                  </th>
                  <th scope="col" className="px-4 py-3">
                    País
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Times
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Conta
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
                {players.map((item) => (
                  <tr key={item.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={item.nickname} src={avatarUrl(item.photo)} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{item.nickname}</p>
                          <p className="truncate text-[13px] text-muted">{item.realName}</p>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-[13px] text-muted">
                      {item.country}
                    </td>

                    <td className="px-4 py-3">
                      {item.teams.length === 0 ? (
                        <span className="text-[13px] text-muted">Sem time</span>
                      ) : (
                        <div className="flex max-w-56 flex-wrap gap-1">
                          {item.teams.map((team) => (
                            <span
                              key={team.id}
                              title={team.name}
                              className="rounded border border-line bg-neutral-50 px-1.5 py-0.5 text-[11px] font-medium"
                            >
                              {team.tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <p className="max-w-56 truncate text-[13px] font-medium">{item.user.name}</p>
                      <p className="max-w-56 truncate text-[11px] text-muted">
                        {roleLabels[item.user.role]}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-[13px] tabular-nums text-muted">
                      {formatDateTime(item.createdAt)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setForm({ mode: 'edit', player: item })}
                          aria-label={`Editar ${item.nickname}`}
                          title="Editar"
                          className={iconButtonClass}
                        >
                          <IconPencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(item)}
                          aria-label={`Excluir ${item.nickname}`}
                          title="Excluir"
                          className={iconButtonClass}
                        >
                          <IconTrash className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-line xl:hidden">
            {players.map((item) => (
              <li key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={item.nickname} src={avatarUrl(item.photo)} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.nickname}</p>
                      <p className="truncate text-[13px] text-muted">{item.realName}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded border border-line bg-neutral-50 px-1.5 py-0.5 text-[11px] font-medium">
                    {item.country}
                  </span>
                </div>

                <div className="mt-3 rounded border border-line bg-neutral-50 px-2.5 py-2">
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
                    Conta
                  </p>
                  <p className="mt-1 truncate text-[13px] font-medium">{item.user.name}</p>
                  <p className="truncate text-[11px] text-muted">{roleLabels[item.user.role]}</p>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-muted">Times:</span>
                  {item.teams.length === 0 ? (
                    <span className="text-[11px] text-muted">nenhum</span>
                  ) : (
                    item.teams.map((team) => (
                      <span
                        key={team.id}
                        title={team.name}
                        className="rounded border border-line bg-neutral-50 px-1.5 py-0.5 text-[11px] font-medium"
                      >
                        {team.tag}
                      </span>
                    ))
                  )}
                </div>

                <p className="mt-2 text-[11px] tabular-nums text-muted">
                  Criado em {formatDateTime(item.createdAt)}
                </p>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ mode: 'edit', player: item })}
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
            ))}
          </ul>
        </div>
      )}

      {form && (
        <PlayerFormDialog
          player={form.mode === 'edit' ? form.player : null}
          users={users}
          players={players}
          onClose={() => setForm(null)}
          onSubmit={handleSave}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Excluir jogador?"
          description={
            <>
              O perfil de <span className="font-medium text-ink">{deleting.nickname}</span> será
              removido. Os vínculos com times são desfeitos, mas a conta de usuário continua ativa.
            </>
          }
          confirmLabel="Excluir jogador"
          errorFallback="Não foi possível excluir o jogador."
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  )
}
