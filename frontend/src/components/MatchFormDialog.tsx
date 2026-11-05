import { useEffect, useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import { ExternalTeamPicker } from './ExternalTeamPicker'
import { Field } from './Field'
import { IconX } from './Icons'
import { Spinner } from './Spinner'
import { cn, matchStatusLabels } from '../lib/format'
import {
  errorBannerClass,
  fieldClass,
  iconButtonClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../lib/styles'
import type { Championship, ChampionshipMatch, MatchInput, MatchStatus, Team } from '../types'

type SideKind = 'local' | 'external'
type EmptyScore = ''

type FormState = {
  championshipId: string
  scheduledAt: string
  status: MatchStatus
  homeScore: string | EmptyScore
  awayScore: string | EmptyScore
}

interface MatchFormDialogProps {
  championship: Championship
  match: ChampionshipMatch | null
  teams: Team[]
  onClose: () => void
  onSubmit: (input: MatchInput) => Promise<void>
}

const EXTERNAL_OPTION = '__external__'

function toLocalInput(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  const pad = (value: number) => String(value).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}

function defaultSchedule() {
  const date = new Date()

  date.setMinutes(0, 0, 0)
  date.setHours(date.getHours() + 1)

  return toLocalInput(date.toISOString())
}

export function MatchFormDialog({
  championship,
  match,
  teams,
  onClose,
  onSubmit,
}: MatchFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  const isEdit = Boolean(match)

  const gameTeams = teams
    .filter((team) => team.gameId === championship.gameId)
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

  const homeDefault = match?.homeTeam.external ? '' : (match?.homeTeam.id ?? gameTeams[0]?.id ?? '')
  const awayDefault = match?.awayTeam.external ? '' : (match?.awayTeam.id ?? gameTeams[1]?.id ?? '')

  const [homeKind, setHomeKind] = useState<SideKind>(
    match?.homeTeam.external ? 'external' : 'local',
  )
  const [homeTeamId, setHomeTeamId] = useState(homeDefault)
  const [homeExternalName, setHomeExternalName] = useState(
    match?.homeTeam.external ? match.homeTeam.name : '',
  )

  const [awayKind, setAwayKind] = useState<SideKind>(
    match?.awayTeam.external ? 'external' : 'local',
  )
  const [awayTeamId, setAwayTeamId] = useState(awayDefault)
  const [awayExternalName, setAwayExternalName] = useState(
    match?.awayTeam.external ? match.awayTeam.name : '',
  )

  const [form, setForm] = useState<FormState>({
    championshipId: championship.id,
    scheduledAt: match ? toLocalInput(match.scheduledAt) : defaultSchedule(),
    status: match?.status ?? 'SCHEDULED',
    homeScore: match?.homeScore != null ? String(match.homeScore) : '',
    awayScore: match?.awayScore != null ? String(match.awayScore) : '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) return

    if (!dialog.open) dialog.showModal()
  }, [])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const homeLabel =
    homeKind === 'local'
      ? (gameTeams.find((team) => team.id === homeTeamId)?.name ?? 'Casa')
      : homeExternalName || 'Casa'

  const awayLabel =
    awayKind === 'local'
      ? (gameTeams.find((team) => team.id === awayTeamId)?.name ?? 'Visitante')
      : awayExternalName || 'Visitante'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (submitting) return

    const errors: Record<string, string> = {}

    if (homeKind === 'local' && !homeTeamId) {
      errors.home = 'Selecione o time da casa.'
    }

    if (homeKind === 'external' && homeExternalName.trim().length < 2) {
      errors.home = 'Informe o nome do time externo.'
    }

    if (awayKind === 'local' && !awayTeamId) {
      errors.away = 'Selecione o time visitante.'
    }

    if (awayKind === 'external' && awayExternalName.trim().length < 2) {
      errors.away = 'Informe o nome do time externo.'
    }

    if (!errors.home && !errors.away) {
      const sameLocal = homeKind === 'local' && awayKind === 'local' && homeTeamId === awayTeamId
      const sameExternal =
        homeKind === 'external' &&
        awayKind === 'external' &&
        homeExternalName.trim().toLowerCase() === awayExternalName.trim().toLowerCase()

      if (sameLocal || sameExternal) {
        errors.away = 'Escolha dois times diferentes.'
      }
    }

    if (!form.scheduledAt) errors.scheduledAt = 'Informe a data e o horário.'

    const homeScore = form.homeScore === '' ? null : Number(form.homeScore)
    const awayScore = form.awayScore === '' ? null : Number(form.awayScore)

    if (form.status !== 'SCHEDULED') {
      if (
        homeScore === null ||
        awayScore === null ||
        !Number.isInteger(homeScore) ||
        !Number.isInteger(awayScore) ||
        homeScore < 0 ||
        awayScore < 0
      ) {
        errors.score = 'Informe um placar válido.'
      }
    }

    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    setFormError(null)

    try {
      await onSubmit({
        championshipId: championship.id,
        homeTeamId: homeKind === 'local' ? homeTeamId : null,
        awayTeamId: awayKind === 'local' ? awayTeamId : null,
        homeTeamName: homeKind === 'external' ? homeExternalName.trim() : null,
        awayTeamName: awayKind === 'external' ? awayExternalName.trim() : null,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        status: form.status,
        homeScore: form.status === 'SCHEDULED' ? null : homeScore,
        awayScore: form.status === 'SCHEDULED' ? null : awayScore,
      })
      onClose()
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : 'Não foi possível salvar a partida.')
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
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-surface px-5 py-4">
          <div>
            <h2 id={titleId} className="text-base font-semibold tracking-tight">
              {isEdit ? 'Editar partida' : 'Nova partida'}
            </h2>
            <p className="mt-0.5 text-[13px] text-muted">
              {championship.name} · {championship.game.name}
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
          <div className="grid items-start gap-5 sm:grid-cols-2">
            <Field id="match-home" label="Time da casa" error={fieldErrors.home}>
              <select
                id="match-home"
                value={homeKind === 'external' ? EXTERNAL_OPTION : homeTeamId}
                onChange={(event) => {
                  const selected = event.target.value

                  if (selected === EXTERNAL_OPTION) {
                    setHomeKind('external')
                    setHomeTeamId('')
                    return
                  }

                  setHomeKind('local')
                  setHomeTeamId(selected)
                }}
                aria-invalid={Boolean(fieldErrors.home)}
                aria-describedby={fieldErrors.home ? 'match-home-error' : undefined}
                className={fieldClass}
              >
                <option value="">Selecione</option>
                {gameTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.tag})
                  </option>
                ))}
                <option value={EXTERNAL_OPTION}>Time externo…</option>
              </select>

              {homeKind === 'external' && (
                <ExternalTeamPicker
                  gameId={championship.gameId}
                  value={homeExternalName}
                  onChange={setHomeExternalName}
                />
              )}
            </Field>

            <Field id="match-away" label="Time visitante" error={fieldErrors.away}>
              <select
                id="match-away"
                value={awayKind === 'external' ? EXTERNAL_OPTION : awayTeamId}
                onChange={(event) => {
                  const selected = event.target.value

                  if (selected === EXTERNAL_OPTION) {
                    setAwayKind('external')
                    setAwayTeamId('')
                    return
                  }

                  setAwayKind('local')
                  setAwayTeamId(selected)
                }}
                aria-invalid={Boolean(fieldErrors.away)}
                aria-describedby={fieldErrors.away ? 'match-away-error' : undefined}
                className={fieldClass}
              >
                <option value="">Selecione</option>
                {gameTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.tag})
                  </option>
                ))}
                <option value={EXTERNAL_OPTION}>Time externo…</option>
              </select>

              {awayKind === 'external' && (
                <ExternalTeamPicker
                  gameId={championship.gameId}
                  value={awayExternalName}
                  onChange={setAwayExternalName}
                />
              )}
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="match-schedule" label="Data e horário" error={fieldErrors.scheduledAt}>
              <input
                id="match-schedule"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(event) => set('scheduledAt', event.target.value)}
                aria-invalid={Boolean(fieldErrors.scheduledAt)}
                aria-describedby={fieldErrors.scheduledAt ? 'match-schedule-error' : undefined}
                className={fieldClass}
              />
            </Field>

            <Field id="match-status" label="Situação">
              <select
                id="match-status"
                value={form.status}
                onChange={(event) => set('status', event.target.value as MatchStatus)}
                className={fieldClass}
              >
                {(Object.keys(matchStatusLabels) as MatchStatus[]).map((status) => (
                  <option key={status} value={status}>
                    {matchStatusLabels[status]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {form.status !== 'SCHEDULED' && (
            <fieldset>
              <legend className={labelClass}>Placar</legend>

              <div className="mt-2 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block truncate text-[11px] text-muted">{homeLabel}</span>
                  <input
                    type="number"
                    min={0}
                    max={999}
                    inputMode="numeric"
                    value={form.homeScore}
                    onChange={(event) => set('homeScore', event.target.value)}
                    aria-invalid={Boolean(fieldErrors.score)}
                    aria-describedby={fieldErrors.score ? 'match-score-error' : undefined}
                    className={cn(fieldClass, 'tabular-nums')}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block truncate text-[11px] text-muted">{awayLabel}</span>
                  <input
                    type="number"
                    min={0}
                    max={999}
                    inputMode="numeric"
                    value={form.awayScore}
                    onChange={(event) => set('awayScore', event.target.value)}
                    aria-invalid={Boolean(fieldErrors.score)}
                    aria-describedby={fieldErrors.score ? 'match-score-error' : undefined}
                    className={cn(fieldClass, 'tabular-nums')}
                  />
                </label>
              </div>

              {fieldErrors.score && (
                <p id="match-score-error" className="mt-1.5 text-[12px] text-muted">
                  {fieldErrors.score}
                </p>
              )}
            </fieldset>
          )}

          {formError && (
            <div role="alert" className={errorBannerClass}>
              {formError}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t border-line bg-neutral-50 px-5 py-4">
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
            {isEdit ? 'Salvar alterações' : 'Criar partida'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
