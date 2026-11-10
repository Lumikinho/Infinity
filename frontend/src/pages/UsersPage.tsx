import { useCallback, useEffect, useState } from 'react'

import { Avatar } from '../components/Avatar'
import { ConfirmDialog } from '../components/ConfirmDialog'
import {
  IconCheck,
  IconCopy,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconTrash,
} from '../components/Icons'
import { LoadError } from '../components/LoadError'
import { LoadingList } from '../components/LoadingList'
import { Notice } from '../components/Notice'
import { PageHeader } from '../components/PageHeader'
import { RoleBadge } from '../components/RoleBadge'
import { UserFormDialog } from '../components/UserFormDialog'
import { avatarUrl, createUser, deleteUser, listUsers, updateUser } from '../lib/localData'
import { cn, formatDateTime } from '../lib/format'
import { iconButtonClass, primaryButtonClass, secondaryButtonClass } from '../lib/styles'
import { useNotice } from '../lib/useNotice'
import type { User, UserInput } from '../types'

type FormState = { mode: 'create' } | { mode: 'edit'; user: User } | null
type LoadState = 'loading' | 'ready' | 'error'

interface UsersPageProps {
  user: User
}

function sortByNewest(list: User[]) {
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

function UuidCell({
  UUID,
  copied,
  onCopy,
  className,
}: {
  UUID: string
  copied: boolean
  onCopy: (UUID: string) => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={() => onCopy(UUID)}
      title={UUID}
      aria-label={copied ? 'UUID copiado' : `Copiar UUID ${UUID}`}
      className={cn(
        'group flex min-h-11 max-w-full items-center gap-1.5 py-1 text-left font-mono text-[11px] leading-tight text-muted transition hover:text-ink md:max-w-64',
        className,
      )}
    >
      <span className="truncate">{UUID}</span>
      {copied ? (
        <IconCheck className="size-3.5 shrink-0 text-ink" />
      ) : (
        <IconCopy className="size-3.5 shrink-0 opacity-0 transition group-hover:opacity-100" />
      )}
    </button>
  )
}

export function UsersPage({ user }: UsersPageProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [form, setForm] = useState<FormState>(null)
  const [deleting, setDeleting] = useState<User | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [notice, setNotice] = useNotice()

  const load = useCallback(async (mode: 'initial' | 'refresh') => {
    if (mode === 'initial') setLoadState('loading')
    else setRefreshing(true)

    setError(null)

    try {
      const list = await listUsers()

      setUsers(sortByNewest(list))
      setLoadState('ready')
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Erro ao carregar usuários.'

      setError(message)
      setLoadState((current) => (current === 'ready' ? 'ready' : 'error'))
    } finally {
      if (mode === 'refresh') setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void load('initial')
  }, [load])

  async function copyUuid(UUID: string) {
    try {
      await navigator.clipboard.writeText(UUID)

      setCopied(UUID)
      window.setTimeout(() => {
        setCopied((current) => (current === UUID ? null : current))
      }, 1600)
    } catch {
      setNotice('Não foi possível copiar o UUID. Selecione o texto na tabela.')
    }
  }

  async function handleSave(input: UserInput) {
    if (form?.mode === 'edit') {
      const updated = await updateUser(form.user.UUID, input)

      setUsers((previous) =>
        sortByNewest(previous.map((item) => (item.UUID === updated.UUID ? updated : item))),
      )
      setNotice(`${updated.name} foi atualizado.`)

      return
    }

    const created = await createUser(input)

    setUsers((previous) => sortByNewest([created, ...previous]))
    setNotice(`${created.name} foi cadastrado.`)
  }

  async function handleDelete() {
    if (!deleting) return

    await deleteUser(deleting.UUID)
    setUsers((previous) => previous.filter((item) => item.UUID !== deleting.UUID))
    setNotice(`${deleting.name} foi removido.`)
  }

  const others = users.filter((item) => item.UUID !== user.UUID)
  const hasOthers = loadState === 'ready' && others.length > 0

  const description =
    loadState === 'ready'
      ? hasOthers
        ? `${others.length} ${others.length === 1 ? 'outra conta' : 'outras contas'}.`
        : 'Você não aparece nesta lista.'
      : 'Contas cadastradas no sistema.'

  return (
    <>
      <PageHeader title="Usuários" description={description}>
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
          className={primaryButtonClass}
        >
          <IconPlus className="size-4" />
          Adicionar usuário
        </button>
      </PageHeader>

      <Notice message={notice} className="mt-4" />

      {error && loadState === 'ready' && (
        <p role="status" className="mt-4 border border-line bg-surface px-3 py-2 text-[13px] text-muted">
          A lista pode estar desatualizada: {error}
        </p>
      )}

      {loadState === 'loading' && (
        <>
          <LoadingList />
          <p role="status" className="sr-only">
            Carregando usuários
          </p>
        </>
      )}

      {loadState === 'error' && (
        <LoadError message={error ?? 'Erro ao carregar usuários.'} onRetry={() => void load('initial')} />
      )}

      {loadState === 'ready' && others.length === 0 && (
        <div className="mt-6 rounded-lg border border-dashed border-neutral-300 bg-surface px-6 py-16 text-center">
          <h2 className="text-base font-semibold">Nenhum outro usuário cadastrado</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted">
            Além de você, não há contas no sistema. Cadastre alguém para começar.
          </p>
          <button
            type="button"
            onClick={() => setForm({ mode: 'create' })}
            className={cn(primaryButtonClass, 'mt-6')}
          >
            <IconPlus className="size-4" />
            Adicionar usuário
          </button>
        </div>
      )}

      {hasOthers && (
        <div className="mt-6 overflow-hidden rounded-lg border border-line bg-surface">
          <div className="hidden overflow-x-auto xl:block">
            <table className="w-full min-w-[56rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-neutral-50 text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
                  <th scope="col" className="px-4 py-3">
                    Usuário
                  </th>
                  <th scope="col" className="px-4 py-3">
                    UUID
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Função
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Criado em
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Atualizado em
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {others.map((item) => (
                  <tr key={item.UUID} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={item.name} src={avatarUrl(item.profilePic)} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{item.name}</p>
                          <p className="truncate text-[13px] text-muted">{item.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <UuidCell
                        UUID={item.UUID}
                        copied={copied === item.UUID}
                        onCopy={(UUID) => void copyUuid(UUID)}
                      />
                    </td>

                    <td className="px-4 py-3">
                      <RoleBadge role={item.role} />
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-[13px] tabular-nums text-muted">
                      {formatDateTime(item.createdAt)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-[13px] tabular-nums text-muted">
                      {formatDateTime(item.updatedAt)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setForm({ mode: 'edit', user: item })}
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
            {others.map((item) => (
              <li key={item.UUID} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={item.name} src={avatarUrl(item.profilePic)} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="truncate text-[13px] text-muted">{item.email}</p>
                    </div>
                  </div>
                  <RoleBadge role={item.role} />
                </div>

                <div className="mt-3 rounded border border-line bg-neutral-50 px-2.5 py-2">
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
                    UUID
                  </p>
                  <UuidCell
                    UUID={item.UUID}
                    copied={copied === item.UUID}
                    onCopy={(UUID) => void copyUuid(UUID)}
                    className="mt-1"
                  />
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-muted">Criado em</dt>
                    <dd className="mt-0.5 tabular-nums">{formatDateTime(item.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Atualizado em</dt>
                    <dd className="mt-0.5 tabular-nums">{formatDateTime(item.updatedAt)}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ mode: 'edit', user: item })}
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
        <UserFormDialog
          user={form.mode === 'edit' ? form.user : null}
          onClose={() => setForm(null)}
          onSubmit={handleSave}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Excluir usuário?"
          description={
            <>
              A conta de <span className="font-medium text-ink">{deleting.name}</span> será removida
              da lista. Essa ação não pode ser desfeita.
            </>
          }
          confirmLabel="Excluir usuário"
          errorFallback="Não foi possível excluir o usuário."
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  )
}
