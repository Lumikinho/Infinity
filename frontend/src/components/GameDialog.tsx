import { useEffect, useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import { Field } from './Field'
import { IconX } from './Icons'
import { Spinner } from './Spinner'
import {
  errorBannerClass,
  fieldClass,
  iconButtonClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../lib/styles'
import type { Game } from '../types'

interface GameDialogProps {
  game: Game | null
  onClose: () => void
  onSubmit: (name: string) => Promise<void>
}

export function GameDialog({ game, onClose, onSubmit }: GameDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const titleId = useId()

  const isEdit = Boolean(game)

  const [name, setName] = useState(game?.name ?? '')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) return

    if (!dialog.open) dialog.showModal()

    nameInputRef.current?.focus()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (submitting) return

    if (name.trim().length < 2) {
      setFieldError('Use pelo menos 2 caracteres.')
      return
    }

    setFieldError(null)
    setSubmitting(true)
    setFormError(null)

    try {
      await onSubmit(name.trim())
      onClose()
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : 'Não foi possível salvar o jogo.')
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
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 id={titleId} className="text-base font-semibold tracking-tight">
              {isEdit ? 'Editar jogo' : 'Novo jogo'}
            </h2>
            <p className="mt-0.5 text-[13px] text-muted">
              {isEdit ? 'Atualize o nome do jogo.' : 'Cadastre um jogo para vincular times.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Fechar"
            className={iconButtonClass}
          >
            <IconX className="size-4" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <Field id="game-name" label="Nome" error={fieldError ?? undefined}>
            <input
              ref={nameInputRef}
              id="game-name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="ex.: Valorant"
              maxLength={60}
              aria-invalid={Boolean(fieldError)}
              aria-describedby={fieldError ? 'game-name-error' : undefined}
              className={fieldClass}
            />
          </Field>

          {formError && (
            <div role="alert" className={errorBannerClass}>
              {formError}
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
          <button type="submit" disabled={submitting} className={primaryButtonClass}>
            {submitting && <Spinner />}
            {isEdit ? 'Salvar alterações' : 'Criar jogo'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
