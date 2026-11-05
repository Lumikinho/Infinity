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
import type { Championship, ChampionshipInput, Game } from '../types'

interface ChampionshipFormDialogProps {
  championship: Championship | null
  games: Game[]
  onClose: () => void
  onSubmit: (input: ChampionshipInput) => Promise<void>
}

export function ChampionshipFormDialog({
  championship,
  games,
  onClose,
  onSubmit,
}: ChampionshipFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const titleId = useId()

  const isEdit = Boolean(championship)

  const [name, setName] = useState(championship?.name ?? '')
  const [gameId, setGameId] = useState(championship?.gameId ?? games[0]?.id ?? '')
  const [startDate, setStartDate] = useState(championship?.startDate.slice(0, 10) ?? '')
  const [endDate, setEndDate] = useState(championship?.endDate?.slice(0, 10) ?? '')
  const [prizePool, setPrizePool] = useState(
    championship?.prizePool != null ? String(championship.prizePool) : '',
  )
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
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

    const errors: Record<string, string> = {}

    if (name.trim().length < 2) errors.name = 'Use pelo menos 2 caracteres.'
    if (!gameId) errors.gameId = 'Selecione o jogo do campeonato.'
    if (!startDate) errors.startDate = 'Informe a data de início.'
    if (endDate && endDate < startDate) errors.endDate = 'Use uma data depois do início.'

    const prizeValue = prizePool.trim() === '' ? null : Number(prizePool)

    if (prizeValue !== null && (!Number.isFinite(prizeValue) || prizeValue < 0)) {
      errors.prizePool = 'Informe um valor válido.'
    }

    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    setFormError(null)

    try {
      await onSubmit({
        name: name.trim(),
        gameId,
        startDate,
        endDate: endDate || null,
        prizePool: prizeValue,
      })
      onClose()
    } catch (cause) {
      setFormError(
        cause instanceof Error ? cause.message : 'Não foi possível salvar o campeonato.',
      )
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
      className="m-auto w-[calc(100%-2rem)] max-w-lg border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/70"
    >
      <form onSubmit={handleSubmit} noValidate className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 id={titleId} className="text-base font-semibold tracking-tight">
              {isEdit ? 'Editar campeonato' : 'Novo campeonato'}
            </h2>
            <p className="mt-0.5 text-[13px] text-muted">
              {isEdit
                ? 'Atualize o nome, o jogo e o período.'
                : 'Defina o jogo e o período do campeonato.'}
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
          <Field id="championship-name" label="Nome do campeonato" error={fieldErrors.name}>
            <input
              ref={nameInputRef}
              id="championship-name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="ex.: Copa Infinity 2026"
              maxLength={80}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? 'championship-name-error' : undefined}
              className={fieldClass}
            />
          </Field>

          <Field id="championship-game" label="Jogo" error={fieldErrors.gameId}>
            <select
              id="championship-game"
              name="gameId"
              value={gameId}
              onChange={(event) => setGameId(event.target.value)}
              aria-invalid={Boolean(fieldErrors.gameId)}
              aria-describedby={fieldErrors.gameId ? 'championship-game-error' : undefined}
              className={fieldClass}
            >
              {games.length === 0 && <option value="">Nenhum jogo cadastrado</option>}

              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="championship-start" label="Início" error={fieldErrors.startDate}>
              <input
                id="championship-start"
                name="startDate"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                aria-invalid={Boolean(fieldErrors.startDate)}
                aria-describedby={fieldErrors.startDate ? 'championship-start-error' : undefined}
                className={fieldClass}
              />
            </Field>

            <Field id="championship-end" label="Término (opcional)" error={fieldErrors.endDate}>
              <input
                id="championship-end"
                name="endDate"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                aria-invalid={Boolean(fieldErrors.endDate)}
                aria-describedby={fieldErrors.endDate ? 'championship-end-error' : undefined}
                className={fieldClass}
              />
            </Field>
          </div>

          <Field
            id="championship-prize"
            label="Premiação (R$, opcional)"
            error={fieldErrors.prizePool}
          >
            <input
              id="championship-prize"
              name="prizePool"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={prizePool}
              onChange={(event) => setPrizePool(event.target.value)}
              placeholder="ex.: 5000"
              aria-invalid={Boolean(fieldErrors.prizePool)}
              aria-describedby={fieldErrors.prizePool ? 'championship-prize-error' : undefined}
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
          <button
            type="submit"
            disabled={submitting || games.length === 0}
            className={primaryButtonClass}
          >
            {submitting && <Spinner />}
            {isEdit ? 'Salvar alterações' : 'Criar campeonato'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
