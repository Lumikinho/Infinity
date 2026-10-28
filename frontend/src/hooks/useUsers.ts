import { useCallback, useEffect, useState } from 'react'
import { createUser, deleteUser, listUsers, updateUser } from '../lib/api'
import type { ApiStatus, CreateUserInput, User, UserInput } from '../types'

function sortByNewest(list: User[]) {
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [status, setStatus] = useState<ApiStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'refresh') => {
    if (mode === 'initial') setStatus('loading')
    else setRefreshing(true)

    setError(null)

    try {
      const list = await listUsers()

      setUsers(sortByNewest(list))
      setStatus('online')
    } catch (cause) {
      setStatus('offline')
      setError(cause instanceof Error ? cause.message : 'Erro ao carregar usuários.')
    } finally {
      if (mode === 'refresh') setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void load('initial')
  }, [load])

  const create = useCallback(async (input: CreateUserInput) => {
    const created = await createUser(input)

    setUsers((previous) => sortByNewest([created, ...previous.filter((u) => u.UUID !== created.UUID)]))
    setStatus('online')

    return created
  }, [])

  const update = useCallback(async (UUID: string, input: UserInput) => {
    const updated = await updateUser(UUID, input)

    setUsers((previous) =>
      previous.map((user) => (user.UUID === UUID ? { ...user, ...updated } : user)),
    )
    setStatus('online')

    return updated
  }, [])

  const remove = useCallback(async (UUID: string) => {
    await deleteUser(UUID)
    setUsers((previous) => previous.filter((user) => user.UUID !== UUID))
    setStatus('online')
  }, [])

  return {
    users,
    status,
    error,
    refreshing,
    refresh: load,
    create,
    update,
    remove,
  }
}
