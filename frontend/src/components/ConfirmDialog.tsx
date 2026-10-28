import { useId, useState } from 'react'
import { DialogShell } from './DialogShell'
import { TrashIcon } from './Icons'
import type { User } from '../types'

interface ConfirmDialogProps {
  user: User
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function ConfirmDialog({ user, onClose, onConfirm }: ConfirmDialogProps) {
  const titleId = useId()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    if (pending) return

    setPending(true)
    setError(null)

    try {
      await onConfirm()
      onClose()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível excluir o usuário.')
      setPending(false)
    }
  }

  return (
    <DialogShell onClose={onClose} closeDisabled={pending} labelledBy={titleId} width="max-w-sm">
      <div className="p-6">
        <span className="grid size-11 place-items-center rounded-full bg-rose-50 text-rose-600 ring-1 ring-rose-100">
          <TrashIcon className="size-5" />
        </span>

        <h2 id={titleId} className="mt-5 text-lg font-medium tracking-[-0.02em]">
          Excluir usuário?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Você está prestes a excluir <span className="font-medium text-ink">{user.name}</span>. Essa
          ação não pode ser desfeita.
        </p>

        {error && <p className="mt-3 text-[13px] text-rose-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="h-10 rounded-xl px-4 text-sm font-medium text-muted transition hover:bg-ink/5 hover:text-ink disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={pending}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-70"
          >
            {pending && (
              <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}
            Excluir
          </button>
        </div>
      </div>
    </DialogShell>
  )
}
