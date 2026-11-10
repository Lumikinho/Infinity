import { useEffect, useId, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

import { Avatar } from './Avatar'
import { Field } from './Field'
import { IconX } from './Icons'
import { Spinner } from './Spinner'
import { avatarUrl } from '../lib/localData'
import { cn, roleOptions } from '../lib/format'
import { errorBannerClass, fieldClass, iconButtonClass, primaryButtonClass, secondaryButtonClass } from '../lib/styles'
import type { User, UserInput, UserRole } from '../types'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface UserFormDialogProps {
  user: User | null
  onClose: () => void
  onSubmit: (input: UserInput) => Promise<void>
}

export function UserFormDialog({ user, onClose, onSubmit }: UserFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const titleId = useId()

  const isEdit = Boolean(user)

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>(user?.role ?? 'USER')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) return

    if (!dialog.open) dialog.showModal()

    nameInputRef.current?.focus()
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

    if (name.trim().length <= 3) errors.name = 'Use pelo menos 4 caracteres.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Informe um email válido.'
    }
    if (!isEdit && password.length <= 3) errors.password = 'Use pelo menos 4 caracteres.'
    if (isEdit && password.length > 0 && password.length <= 3) {
      errors.password = 'Use pelo menos 4 caracteres.'
    }

    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    setFormError(null)

    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        role,
        password: password || undefined,
        profilePic: file,
      })
      onClose()
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : 'Não foi possível salvar o usuário.')
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
              {isEdit ? 'Editar usuário' : 'Novo usuário'}
            </h2>
            <p className="mt-0.5 text-[13px] text-muted">
              {isEdit ? 'Atualize os dados e salve.' : 'Preencha os dados da nova conta.'}
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
              name={name || '?'}
              src={preview ?? avatarUrl(user?.profilePic ?? null)}
              size="lg"
            />

            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(secondaryButtonClass, 'h-11 px-3 text-[13px]')}
              >
                {user?.profilePic || preview ? 'Trocar foto' : 'Escolher foto'}
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

          <Field id="user-name" label="Nome" error={fieldErrors.name}>
            <input
              ref={nameInputRef}
              id="user-name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nome completo"
              autoComplete="name"
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? 'user-name-error' : undefined}
              className={fieldClass}
            />
          </Field>

          <Field id="user-email" label="Email" error={fieldErrors.email}>
            <input
              id="user-email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nome@exemplo.com"
              autoComplete="email"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'user-email-error' : undefined}
              className={fieldClass}
            />
          </Field>

          <Field id="user-role" label="Função">
            <select
              id="user-role"
              name="role"
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
              className={fieldClass}
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="user-password"
            label="Senha"
            hint={isEdit ? 'deixe em branco para manter' : undefined}
            error={fieldErrors.password}
          >
            <input
              id="user-password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={isEdit ? 'Nova senha' : 'Mínimo de 4 caracteres'}
              autoComplete="new-password"
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'user-password-error' : undefined}
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
            {isEdit ? 'Salvar alterações' : 'Criar usuário'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
