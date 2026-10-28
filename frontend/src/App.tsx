import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Toolbar } from './components/Toolbar'
import { UserList } from './components/UserList'
import { UserFormModal } from './components/UserFormModal'
import { ConfirmDialog } from './components/ConfirmDialog'
import { useToast } from './components/Toast'
import { useUsers } from './hooks/useUsers'
import type { RoleFilter, User, UserInput } from './types'

type FormState = { mode: 'create' } | { mode: 'edit'; user: User } | null

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function App() {
  const { users, status, error, refreshing, refresh, create, update, remove } = useUsers()
  const toast = useToast()

  const [query, setQuery] = useState('')
  const [role, setRole] = useState<RoleFilter>('ALL')
  const [form, setForm] = useState<FormState>(null)
  const [deleting, setDeleting] = useState<User | null>(null)

  const filteredUsers = useMemo(() => {
    const term = normalize(query.trim())

    return users.filter((user) => {
      const matchesRole = role === 'ALL' || user.role === role
      const matchesQuery =
        term.length === 0 ||
        normalize(user.name).includes(term) ||
        normalize(user.email).includes(term)

      return matchesRole && matchesQuery
    })
  }, [users, query, role])

  const stats = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((user) => user.role === 'ADMIN').length,
      players: users.filter((user) => user.role === 'PLAYER').length,
    }),
    [users],
  )

  const hasFilters = query.trim().length > 0 || role !== 'ALL'

  async function handleSubmit(input: UserInput) {
    if (form?.mode === 'edit') {
      const updated = await update(form.user.UUID, input)

      toast.push({
        variant: 'success',
        title: 'Usuário atualizado',
        description: updated.name,
      })

      return
    }

    const created = await create({ ...input, password: input.password ?? '' })

    toast.push({
      variant: 'success',
      title: 'Usuário cadastrado',
      description: created.name,
    })
  }

  async function handleDelete() {
    if (!deleting) return

    await remove(deleting.UUID)

    toast.push({
      variant: 'success',
      title: 'Usuário excluído',
      description: `${deleting.name} foi removido da equipe.`,
    })
  }

  function clearFilters() {
    setQuery('')
    setRole('ALL')
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(60%_100%_at_50%_0%,rgba(67,56,202,0.09),transparent_72%)]"
      />

      <Header status={status} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-16 sm:px-8">
        <Hero total={stats.total} admins={stats.admins} players={stats.players} />

        <section aria-labelledby="users-heading" className="mt-14">
          <h2 id="users-heading" className="sr-only">
            Usuários
          </h2>

          <Toolbar
            query={query}
            role={role}
            refreshing={refreshing}
            onQueryChange={setQuery}
            onRoleChange={setRole}
            onRefresh={() => void refresh('refresh')}
            onNew={() => setForm({ mode: 'create' })}
          />

          {error && users.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2.5 text-[13px] text-amber-800"
            >
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-amber-500" />
              <p>Não foi possível sincronizar agora. Exibindo a última lista carregada.</p>
            </motion.div>
          )}

          <div className="mt-6">
            <UserList
              users={filteredUsers}
              total={users.length}
              status={status}
              error={error}
              hasFilters={hasFilters}
              onRetry={() => void refresh('initial')}
              onClearFilters={clearFilters}
              onNew={() => setForm({ mode: 'create' })}
              onEdit={(user) => setForm({ mode: 'edit', user })}
              onDelete={setDeleting}
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-5 py-6 text-[10px] font-medium uppercase tracking-[0.16em] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>Infinity · {new Date().getFullYear()}</p>
          <p>React · Vite · Tailwind · Motion</p>
        </div>
      </footer>

      <AnimatePresence>
        {form && (
          <UserFormModal
            key="user-form"
            user={form.mode === 'edit' ? form.user : null}
            onClose={() => setForm(null)}
            onSubmit={handleSubmit}
          />
        )}

        {deleting && (
          <ConfirmDialog
            key="confirm-delete"
            user={deleting}
            onClose={() => setDeleting(null)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
