import { useState } from 'react'
import type { FormEvent } from 'react'

import { AuthShell } from '../components/AuthShell'
import { Field } from '../components/Field'
import { Spinner } from '../components/Spinner'
import { login } from '../lib/api'
import { errorBannerClass, fieldClass, primaryButtonClass } from '../lib/styles'
import type { User } from '../types'

interface LoginPageProps {
  onAuthenticated: (user: User) => void
}

export function LoginPage({ onAuthenticated }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (submitting) return

    const errors: { email?: string; password?: string } = {}

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Informe um email válido.'
    }
    if (!password) errors.password = 'Informe sua senha.'

    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) return

    setFormError(null)
    setSubmitting(true)

    try {
      const user = await login(email, password)

      onAuthenticated(user)
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : 'Não foi possível entrar.')
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Acesso"
      title="Entrar na sua conta"
      subtitle="Use o email e a senha cadastrados para abrir o painel."
      footer={
        <p>
          Acesso restrito a contas cadastradas.{' '}
          <a
            href="#/"
            className="font-medium text-ink underline decoration-line-strong underline-offset-4 transition hover:decoration-accent"
          >
            Voltar ao site
          </a>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Field id="login-email" label="Email" error={fieldErrors.email}>
          <input
            id="login-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nome@exemplo.com"
            autoComplete="email"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
            className={fieldClass}
          />
        </Field>

        <Field id="login-password" label="Senha" error={fieldErrors.password}>
          <input
            id="login-password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Sua senha"
            autoComplete="current-password"
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
            className={fieldClass}
          />
        </Field>

        {formError && (
          <div role="alert" className={errorBannerClass}>
            {formError}
          </div>
        )}

        <button type="submit" disabled={submitting} className={`${primaryButtonClass} w-full`}>
          {submitting && <Spinner />}
          {submitting ? 'Entrando' : 'Entrar'}
        </button>
      </form>
    </AuthShell>
  )
}
