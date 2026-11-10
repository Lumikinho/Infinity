import { useEffect, useId, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

import { Avatar } from './Avatar'
import { Field } from './Field'
import { IconX } from './Icons'
import { Spinner } from './Spinner'
import { avatarUrl } from '../lib/localData'
import { cn } from '../lib/format'
import {
  errorBannerClass,
  fieldClass,
  iconButtonClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../lib/styles'
import type { Player, PlayerInput, User } from '../types'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface PlayerFormDialogProps {
  player: Player | null
  users: User[]
  players: Player[]
  onClose: () => void
  onSubmit: (input: PlayerInput) => Promise<void>
}

export function PlayerFormDialog({
  player,
  users,
  players,
  onClose,
  onSubmit,
}: PlayerFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const nicknameInputRef = useRef<HTMLInputElement>(null)
  const titleId = useId()

  const isEdit = Boolean(player)

  const availableUsers = users.filter(
    (item) =>
      !players.some((entry) => entry.userId === item.UUID && entry.id !== player?.id),
  )

  const [nickname, setNickname] = useState(player?.nickname ?? '')
  const [realName, setRealName] = useState(player?.realName ?? '')
  const [country, setCountry] = useState(player?.country ?? '')
  const [userId, setUserId] = useState(player?.userId ?? availableUsers[0]?.UUID ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) return

    if (!dialog.open) dialog.showModal()

    nicknameInputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }

    const url = URL.createObjectURL(file)
    setPreview(url)

    return () => URL.revokeObjectURL(url)
  }, [file])

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]

    event.target.value = ''

    if (!selected) return

    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setFormError('Formato inválido. Envie uma imagem JPG, PNG ou WebP.')
      return
    }

    if (selected.size > MAX_IMAGE_SIZE) {
      setFormError('A imagem deve ter no máximo 5 MB.')
      return
    }

    setFormError(null)
    setFile(selected)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (submitting) return

    const errors: Record<string, string> = {}

    if (nickname.trim().length < 2) errors.nickname = 'Use pelo menos 2 caracteres.'
    if (realName.trim().length < 3) errors.realName = 'Use pelo menos 3 caracteres.'
    if (country.trim().length < 2) errors.country = 'Informe o país.'
    if (!userId) errors.userId = 'Selecione a conta do jogador.'

    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    setFormError(null)

    try {
      await onSubmit({
        nickname: nickname.trim(),
        realName: realName.trim(),
        country: country.trim(),
        userId,
        photo: file,
      })
      onClose()
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : 'Não foi possível salvar o jogador.')
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
              {isEdit ? 'Editar jogador' : 'Novo jogador'}
            </h2>
            <p className="mt-0.5 text-[13px] text-muted">
              {isEdit ? 'Atualize o perfil e salve.' : 'Crie o perfil a partir de uma conta.'}
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
          <div className="flex items-center gap-4">
            <Avatar
              name={nickname || '?'}
              src={preview ?? avatarUrl(player?.photo ?? null)}
              size="lg"
            />

            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(secondaryButtonClass, 'h-11 px-3 text-[13px]')}
              >
                {player?.photo || preview ? 'Trocar foto' : 'Escolher foto'}
              </button>
              <p className="mt-1 text-[11px] text-muted">JPG, PNG ou WebP até 5 MB.</p>

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                onChange={handleFileChange}
                aria-hidden="true"
                className="hidden"
                tabIndex={-1}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="player-nickname" label="Nickname" error={fieldErrors.nickname}>
              <input
                ref={nicknameInputRef}
                id="player-nickname"
                name="nickname"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="ex.: frost"
                maxLength={40}
                aria-invalid={Boolean(fieldErrors.nickname)}
                aria-describedby={fieldErrors.nickname ? 'player-nickname-error' : undefined}
                className={fieldClass}
              />
            </Field>

            <Field id="player-country" label="País" error={fieldErrors.country}>
              <input
                id="player-country"
                name="country"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                placeholder="ex.: BR"
                maxLength={40}
                aria-invalid={Boolean(fieldErrors.country)}
                aria-describedby={fieldErrors.country ? 'player-country-error' : undefined}
                className={fieldClass}
              />
            </Field>
          </div>

          <Field id="player-real-name" label="Nome real" error={fieldErrors.realName}>
            <input
              id="player-real-name"
              name="realName"
              value={realName}
              onChange={(event) => setRealName(event.target.value)}
              placeholder="Nome completo"
              maxLength={80}
              aria-invalid={Boolean(fieldErrors.realName)}
              aria-describedby={fieldErrors.realName ? 'player-real-name-error' : undefined}
              className={fieldClass}
            />
          </Field>

          <Field
            id="player-user"
            label="Conta vinculada"
            hint="obrigatório"
            error={fieldErrors.userId}
          >
            <select
              id="player-user"
              name="userId"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              aria-invalid={Boolean(fieldErrors.userId)}
              aria-describedby={fieldErrors.userId ? 'player-user-error' : undefined}
              className={fieldClass}
            >
              {availableUsers.length === 0 && <option value="">Nenhuma conta disponível</option>}

              {availableUsers.map((item) => (
                <option key={item.UUID} value={item.UUID}>
                  {item.name} — {item.email}
                </option>
              ))}
            </select>
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
            disabled={submitting || availableUsers.length === 0}
            className={primaryButtonClass}
          >
            {submitting && <Spinner />}
            {isEdit ? 'Salvar alterações' : 'Criar jogador'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
