import { useEffect, useId, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { DialogShell } from './DialogShell'
import { ImageCropper } from './ImageCropper'
import { Avatar } from './Avatar'
import { RoleBadge } from './UserList'
import { AlertIcon, ArrowLeftIcon, ArrowRightIcon, PencilIcon, XIcon } from './Icons'
import { avatarUrl } from '../lib/api'
import { cn, roleLabels } from '../lib/utils'
import type { User, UserInput } from '../types'

const MAX_SOURCE_SIZE = 20 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const inputClass =
  'h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-ink/25 focus:ring-4 focus:ring-ink/[0.04] aria-[invalid=true]:border-rose-300 aria-[invalid=true]:focus:ring-rose-100'

type Step = 'form' | 'image' | 'review'

interface UserFormModalProps {
  user: User | null
  onClose: () => void
  onSubmit: (input: UserInput) => Promise<void>
}

interface FieldProps {
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
}

function Field({ id, label, hint, error, children }: FieldProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-medium">
          {label}
        </label>
        {hint && <span className="text-[11px] text-muted">{hint}</span>}
      </div>
      <div className="mt-2">{children}</div>
      {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-rose-200/80 bg-rose-50 px-3 py-2.5 text-[13px] leading-snug text-rose-700"
    >
      <AlertIcon className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

function ReviewRow({
  label,
  value,
  changed = false,
  dimmed = false,
}: {
  label: string
  value: string
  changed?: boolean
  dimmed?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-3">
      <dt className="shrink-0 text-[13px] text-muted">{label}</dt>
      <dd className="flex min-w-0 flex-wrap items-center justify-end gap-2 text-right">
        <span
          className={cn(
            'break-words text-[13px]',
            dimmed ? 'text-muted' : 'font-medium text-ink',
          )}
        >
          {value}
        </span>
        {changed && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200/70">
            alterado
          </span>
        )}
      </dd>
    </div>
  )
}

export function UserFormModal({ user, onClose, onSubmit }: UserFormModalProps) {
  const titleId = useId()
  const fileId = useId()
  const fileInput = useRef<HTMLInputElement>(null)

  const isEdit = Boolean(user)

  const [step, setStep] = useState<Step>('form')
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(avatarUrl(user?.profilePic ?? null))
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const changes = {
    name: name.trim() !== (user?.name ?? ''),
    email: email.trim() !== (user?.email ?? ''),
    password: password.trim().length > 0,
    photo: Boolean(file),
  }

  const hasChanges = changes.name || changes.email || changes.password || changes.photo

  useEffect(() => {
    return () => {
      if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
    }
  }, [preview])

  useEffect(() => {
    if (step === 'form') return

    document.getElementById(titleId)?.focus({ preventScroll: true })
  }, [step, titleId])

  function handleRequestClose() {
    if (submitting) return

    if (step === 'form') {
      onClose()
      return
    }

    setPendingFile(null)
    setStep('form')
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]

    event.target.value = ''

    if (!selected) return

    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setFormError('Formato inválido. Envie uma imagem JPG, PNG ou WebP.')
      return
    }

    if (selected.size > MAX_SOURCE_SIZE) {
      setFormError('A imagem deve ter no máximo 20 MB.')
      return
    }

    setFormError(null)
    setPendingFile(selected)
    setStep('image')
  }

  function handleApplyImage(cropped: File) {
    setFile(cropped)
    setPreview(URL.createObjectURL(cropped))
    setPendingFile(null)
    setFormError(null)
    setStep('form')
  }

  function handleRemoveImage() {
    setFile(null)
    setPendingFile(null)
    setFormError(null)
    setPreview(avatarUrl(user?.profilePic ?? null))
  }

  function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (submitting) return

    const errors: Record<string, string> = {}
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (trimmedName.length <= 3) errors.name = 'Use pelo menos 4 caracteres.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) errors.email = 'Informe um email válido.'
    if (!isEdit && trimmedPassword.length <= 3) errors.password = 'Use pelo menos 4 caracteres.'
    if (isEdit && trimmedPassword.length > 0 && trimmedPassword.length <= 3) {
      errors.password = 'Use pelo menos 4 caracteres.'
    }

    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) return

    if (isEdit && !hasChanges) {
      setFormError('Nenhuma alteração detectada. Ajuste algum campo para continuar.')
      return
    }

    setFormError(null)
    setStep('review')
  }

  async function handleConfirm() {
    if (submitting) return

    setSubmitting(true)
    setFormError(null)

    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        password: password.trim() || undefined,
        profilePic: file,
      })
      onClose()
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : 'Não foi possível salvar o usuário.')
      setSubmitting(false)
    }
  }

  const copy =
    step === 'form'
      ? {
          title: isEdit ? 'Editar usuário' : 'Novo usuário',
          subtitle: isEdit
            ? 'Atualize os dados e revise antes de salvar.'
            : 'Adicione uma pessoa à sua equipe em poucos segundos.',
        }
      : step === 'image'
        ? {
            title: 'Ajustar foto',
            subtitle: 'Arraste para reposicionar e ajuste o zoom da imagem.',
          }
        : {
            title: isEdit ? 'Confirmar alterações' : 'Confirmar cadastro',
            subtitle: 'Revise as informações antes de confirmar.',
          }

  return (
    <DialogShell onClose={handleRequestClose} closeDisabled={submitting} labelledBy={titleId}>
      <div className="border-b border-line px-6 py-5 pr-14">
        <div className="flex flex-wrap items-center gap-2">
          <h2
            id={titleId}
            tabIndex={-1}
            className="text-lg font-medium tracking-[-0.02em] outline-none"
          >
            {copy.title}
          </h2>
          {isEdit && user && step === 'form' && <RoleBadge role={user.role} />}
        </div>
        <p className="mt-1 text-[13px] text-muted">{copy.subtitle}</p>

        <button
          type="button"
          onClick={handleRequestClose}
          disabled={submitting}
          aria-label={step === 'form' ? 'Fechar' : 'Voltar'}
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-lg text-muted transition hover:bg-canvas hover:text-ink disabled:opacity-50"
        >
          {step === 'form' ? <XIcon className="size-4" /> : <ArrowLeftIcon className="size-4" />}
        </button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <form onSubmit={handleReview} noValidate>
              <div className="space-y-5 px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar name={name || '?'} src={preview} size="lg" />
                    <button
                      type="button"
                      onClick={() => fileInput.current?.click()}
                      aria-label={preview ? 'Trocar foto' : 'Adicionar foto'}
                      className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full bg-ink text-white ring-2 ring-surface transition hover:scale-105"
                    >
                      <PencilIcon className="size-3" />
                    </button>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <button
                        type="button"
                        onClick={() => fileInput.current?.click()}
                        className="text-[13px] font-medium underline decoration-line underline-offset-4 transition hover:decoration-ink"
                      >
                        {preview ? 'Trocar imagem' : 'Adicionar foto'}
                      </button>

                      {file && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="text-[11px] text-muted underline decoration-line underline-offset-4 transition hover:text-ink"
                        >
                          Desfazer
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-muted">
                      JPG, PNG ou WebP · até 20 MB · recorte 1:1
                    </p>
                  </div>

                  <input
                    id={fileId}
                    ref={fileInput}
                    type="file"
                    accept={ACCEPTED_TYPES.join(',')}
                    onChange={handleFileChange}
                    className="sr-only"
                    tabIndex={-1}
                  />
                </div>

                <Field id="user-name" label="Nome" error={fieldErrors.name}>
                  <input
                    id="user-name"
                    name="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Como devemos chamar essa pessoa?"
                    autoComplete="name"
                    autoFocus
                    aria-invalid={Boolean(fieldErrors.name)}
                    className={inputClass}
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
                    className={inputClass}
                  />
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
                    placeholder={isEdit ? '••••••••' : 'Mínimo de 4 caracteres'}
                    autoComplete="new-password"
                    aria-invalid={Boolean(fieldErrors.password)}
                    className={inputClass}
                  />
                </Field>

                {formError && <ErrorBanner message={formError} />}
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-line bg-[#fbfaf7] px-6 py-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="h-10 rounded-xl px-4 text-sm font-medium text-muted transition hover:bg-ink/5 hover:text-ink disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-ink px-4 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  Revisar dados
                  <ArrowRightIcon className="size-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {step === 'image' && pendingFile && (
          <motion.div
            key="image"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <ImageCropper
              file={pendingFile}
              onCancel={() => {
                setPendingFile(null)
                setStep('form')
              }}
              onApply={handleApplyImage}
            />
          </motion.div>
        )}

        {step === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div className="px-6 py-5">
              <div className="flex items-center gap-3 rounded-2xl border border-line bg-[#fbfaf7] p-3">
                <Avatar name={name.trim() || '?'} src={preview} size="lg" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{name.trim()}</p>
                  <p className="truncate text-[13px] text-muted">{email.trim()}</p>
                  {changes.photo && (
                    <span className="mt-1 inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200/70">
                      nova foto
                    </span>
                  )}
                </div>
              </div>

              <dl className="mt-4 divide-y divide-line border-y border-line">
                <ReviewRow
                  label="Nome"
                  value={name.trim()}
                  changed={isEdit && changes.name}
                  dimmed={isEdit && !changes.name}
                />
                <ReviewRow
                  label="Email"
                  value={email.trim()}
                  changed={isEdit && changes.email}
                  dimmed={isEdit && !changes.email}
                />
                <ReviewRow
                  label="Função"
                  value={roleLabels[user?.role ?? 'USER']}
                  dimmed={isEdit}
                />
                <ReviewRow
                  label="Senha"
                  value={
                    isEdit
                      ? changes.password
                        ? 'Nova senha será definida'
                        : 'Mantida sem alterações'
                      : '••••••••'
                  }
                  changed={isEdit && changes.password}
                  dimmed={isEdit && !changes.password}
                />
              </dl>

              {formError && (
                <div className="mt-4">
                  <ErrorBanner message={formError} />
                </div>
              )}

              <p className="mt-4 text-xs leading-relaxed text-muted">
                {isEdit
                  ? 'As alterações serão aplicadas assim que você confirmar.'
                  : 'O usuário será cadastrado com a função Usuário.'}
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-line bg-[#fbfaf7] px-6 py-4">
              <button
                type="button"
                onClick={() => setStep('form')}
                disabled={submitting}
                className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted transition hover:bg-ink/5 hover:text-ink disabled:opacity-50"
              >
                <ArrowLeftIcon className="size-4" />
                Voltar
              </button>
              <button
                type="button"
                onClick={() => void handleConfirm()}
                disabled={submitting}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-ink px-4 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-70"
              >
                {submitting && (
                  <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}
                {isEdit ? 'Salvar alterações' : 'Confirmar cadastro'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DialogShell>
  )
}
