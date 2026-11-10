import { useCallback, useEffect, useState } from 'react'

import { ConfirmDialog } from '../components/ConfirmDialog'
import { GameDialog } from '../components/GameDialog'
import { IconPencil, IconPlus, IconRefresh, IconTrash } from '../components/Icons'
import { LoadError } from '../components/LoadError'
import { LoadingList } from '../components/LoadingList'
import { Notice } from '../components/Notice'
import { PageHeader } from '../components/PageHeader'
import { createGame, deleteGame, listGames, updateGame } from '../lib/localData'
import { cn } from '../lib/format'
import { iconButtonClass, primaryButtonClass, secondaryButtonClass } from '../lib/styles'
import { useNotice } from '../lib/useNotice'
import type { Game } from '../types'

type FormState = { mode: 'create' } | { mode: 'edit'; game: Game } | null
type LoadState = 'loading' | 'ready' | 'error'

function sortByName(list: Game[]) {
  return [...list].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
}

export function GamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [form, setForm] = useState<FormState>(null)
  const [deleting, setDeleting] = useState<Game | null>(null)
  const [notice, setNotice] = useNotice()

  const load = useCallback(async (mode: 'initial' | 'refresh') => {
    if (mode === 'initial') setLoadState('loading')
    else setRefreshing(true)

    setError(null)

    try {
      setGames(sortByName(await listGames()))
      setLoadState('ready')
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Erro ao carregar jogos.'

      setError(message)
      setLoadState((current) => (current === 'ready' ? 'ready' : 'error'))
    } finally {
      if (mode === 'refresh') setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void load('initial')
  }, [load])

  async function handleSave(name: string) {
    if (form?.mode === 'edit') {
      const updated = await updateGame(form.game.id, name)

      setGames((previous) =>
        sortByName(
          previous.map((item) =>
            item.id === updated.id ? { ...item, name: updated.name } : item,
          ),
        ),
      )
      setNotice(`${updated.name} foi atualizado.`)

      return
    }

    const created = await createGame(name)

    setGames((previous) => sortByName([created, ...previous]))
    setNotice(`${created.name} foi cadastrado.`)
  }

  async function handleDelete() {
    if (!deleting) return

    await deleteGame(deleting.id)
    setGames((previous) => previous.filter((item) => item.id !== deleting.id))
    setNotice(`${deleting.name} foi removido.`)
  }

  const description =
    loadState === 'ready' && games.length > 0
      ? `${games.length} ${games.length === 1 ? 'jogo cadastrado' : 'jogos cadastrados'}.`
      : 'Jogos usados para organizar os times.'

  return (
    <>
      <PageHeader title="Jogos" description={description}>
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
          disabled={loadState !== 'ready'}
          className={primaryButtonClass}
        >
          <IconPlus className="size-4" />
          Adicionar jogo
        </button>
      </PageHeader>

      <Notice message={notice} className="mt-4" />

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
            Carregando jogos
          </p>
        </>
      )}

      {loadState === 'error' && (
        <LoadError message={error ?? 'Erro ao carregar jogos.'} onRetry={() => void load('initial')} />
      )}

      {loadState === 'ready' && games.length === 0 && (
        <div className="mt-6 rounded-lg border border-dashed border-neutral-300 bg-surface px-6 py-16 text-center">
          <h2 className="text-base font-semibold">Nenhum jogo cadastrado</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted">
            Cadastre um jogo para poder criar times vinculados a ele.
          </p>
          <button
            type="button"
            onClick={() => setForm({ mode: 'create' })}
            className={cn(primaryButtonClass, 'mt-6')}
          >
            <IconPlus className="size-4" />
            Adicionar jogo
          </button>
        </div>
      )}

      {loadState === 'ready' && games.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg border border-line bg-surface">
          <div className="hidden overflow-x-auto xl:block">
            <table className="w-full min-w-[36rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-neutral-50 text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
                  <th scope="col" className="px-4 py-3">
                    Jogo
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Times
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {games.map((item) => (
                  <tr key={item.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{item.name}</p>
                    </td>

                    <td className="px-4 py-3">
                      {item.teamsCount === 0 ? (
                        <span className="text-[13px] text-muted">Sem times</span>
                      ) : (
                        <span className="text-[13px]">
                          {item.teamsCount} {item.teamsCount === 1 ? 'time' : 'times'}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setForm({ mode: 'edit', game: item })}
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
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-line xl:hidden">
            {games.map((item) => (
              <li key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="mt-0.5 text-[11px] text-muted">
                      {item.teamsCount === 0
                        ? 'Sem times'
                        : `${item.teamsCount} ${item.teamsCount === 1 ? 'time' : 'times'}`}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ mode: 'edit', game: item })}
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
        <GameDialog
          game={form.mode === 'edit' ? form.game : null}
          onClose={() => setForm(null)}
          onSubmit={handleSave}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Excluir jogo?"
          description={
            <>
              O jogo <span className="font-medium text-ink">{deleting.name}</span> será removido.
              Jogos com times cadastrados não podem ser excluídos.
            </>
          }
          confirmLabel="Excluir jogo"
          errorFallback="Não foi possível excluir o jogo."
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  )
}
