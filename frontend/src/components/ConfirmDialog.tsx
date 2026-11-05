import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { Spinner } from './Spinner'
import { errorBannerClass, primaryButtonClass, secondaryButtonClass } from '../lib/styles'

interface ConfirmDialogProps {
  title: string
  description: ReactNode
  confirmLabel: string
  errorFallback?: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  errorFallback = 'Não foi possível concluir a exclusão.',
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current

    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  async function handleConfirm() {
    if (submitting) return

    setSubmitting(true)
    setError(null)

    try {
      await onConfirm()
      onClose()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : errorFallback)
      setSubmitting(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        if (submitting) {
          event.preventDefault()
          return
        }

        onClose()
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current && !submitting) onClose()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/70"
    >
      <div className="px-5 py-5">
        <h2 id={titleId} className="text-base font-semibold tracking-tight">
          {title}
        </h2>
        <div className="mt-2 text-sm leading-relaxed text-muted">{description}</div>

        {error && (
          <div role="alert" className={`mt-4 ${errorBannerClass}`}>
            {error}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-line bg-neutral-50 px-5 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className={secondaryButtonClass}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => void handleConfirm()}
          disabled={submitting}
          className={primaryButtonClass}
        >
          {submitting && <Spinner />}
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
