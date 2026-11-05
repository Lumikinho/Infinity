import { useEffect, useId, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

import { Avatar } from './Avatar'
import { Field } from './Field'
import { IconX } from './Icons'
import { Spinner } from './Spinner'
import { TeamLogo } from './TeamLogo'
import { avatarUrl } from '../lib/api'
import { cn } from '../lib/format'
import {
  errorBannerClass,
  fieldClass,
  iconButtonClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../lib/styles'
import type { Game, Player, Team, TeamInput } from '../types'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface TeamFormDialogProps {
  team: Team | null
  games: Game[]
  players: Player[]
  onClose: () => void
  onSubmit: (input: TeamInput) => Promise<void>
}

export function TeamFormDialog({ team, games, players, onClose, onSubmit }: TeamFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const titleId = useId()

  const isEdit = Boolean(team)

  const [name, setName] = useState(team?.name ?? '')
  const [tag, setTag] = useState(team?.tag ?? '')
  const [gameId, setGameId] = useState(team?.gameId ?? games[0]?.id ?? '')
  const [playerIds, setPlayerIds] = useState<string[]>(
    team?.players.map((player) => player.id) ?? [],
  )
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const sortedPlayers = [...players].sort((a, b) => a.nickname.localeCompare(b.nickname, 'pt-BR'))

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

  function togglePlayer(id: string) {
    setPlayerIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (submitting) return

    const errors: Record<string, string> = {}

    if (name.trim().length < 2) errors.name = 'Use pelo menos 2 caracteres.'
    if (tag.trim().length < 2) errors.tag = 'Use pelo menos 2 caracteres.'
    if (!gameId) errors.gameId = 'Selecione o jogo do time.'

    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    setFormError(null)

    try {
      await onSubmit({
        name: name.trim(),
        tag: tag.trim().toUpperCase(),
        gameId,
        playerIds,
        logo: file,
      })
      onClose()
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : 'Não foi possível salvar o time.')
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
              {isEdit ? 'Editar time' : 'Novo time'}
            </h2>
            <p className="mt-0.5 text-[13px] text-muted">
              {isEdit ? 'Atualize o time, o jogo e o elenco.' : 'Defina o jogo e os jogadores.'}
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
            <TeamLogo
              name={name || '?'}
              src={preview ?? avatarUrl(team?.logo ?? null)}
              size="lg"
            />

            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(secondaryButtonClass, 'h-11 px-3 text-[13px]')}
              >
                {team?.logo || preview ? 'Trocar escudo' : 'Escolher escudo'}
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

          <div className="grid gap-5 sm:grid-cols-[1fr_8rem]">
            <Field id="team-name" label="Nome do time" error={fieldErrors.name}>
              <input
                ref={nameInputRef}
                id="team-name"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="ex.: Infinity Esports"
                maxLength={60}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? 'team-name-error' : undefined}
                className={fieldClass}
              />
            </Field>

            <Field id="team-tag" label="Tag" error={fieldErrors.tag}>
              <input
                id="team-tag"
                name="tag"
                value={tag}
                onChange={(event) => setTag(event.target.value.toUpperCase())}
                placeholder="INF"
                maxLength={8}
                aria-invalid={Boolean(fieldErrors.tag)}
                aria-describedby={fieldErrors.tag ? 'team-tag-error' : undefined}
                className={`${fieldClass} uppercase`}
              />
            </Field>
          </div>

          <Field id="team-game" label="Jogo" error={fieldErrors.gameId}>
            <select
              id="team-game"
              name="gameId"
              value={gameId}
              onChange={(event) => setGameId(event.target.value)}
              aria-invalid={Boolean(fieldErrors.gameId)}
              aria-describedby={fieldErrors.gameId ? 'team-game-error' : undefined}
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

          <div>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[13px] font-medium">Jogadores</p>
              <span className="text-[11px] text-muted">
                {playerIds.length === 0
                  ? 'nenhum selecionado'
                  : `${playerIds.length} selecionado${playerIds.length === 1 ? '' : 's'}`}
              </span>
            </div>

            {sortedPlayers.length === 0 ? (
              <p className="mt-2 rounded-md border border-dashed border-neutral-300 bg-surface px-3 py-4 text-[13px] text-muted">
                Nenhum jogador cadastrado. O time pode ser criado sem elenco.
              </p>
            ) : (
              <div className="mt-2 max-h-56 overflow-y-auto rounded-md border border-line">
                {sortedPlayers.map((player) => {
                  const checked = playerIds.includes(player.id)

                  return (
                    <label
                      key={player.id}
                      className={cn(
                        'flex min-h-11 cursor-pointer items-center gap-2.5 border-b border-line px-3 py-2 transition last:border-0',
                        checked ? 'bg-neutral-100' : 'hover:bg-neutral-50',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePlayer(player.id)}
                        className="size-4 shrink-0 accent-ink"
                      />
                      <Avatar
                        name={player.nickname}
                        src={avatarUrl(player.photo)}
                        size="sm"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium">
                          {player.nickname}
                        </span>
                        <span className="block truncate text-[11px] text-muted">
                          {player.realName} · {player.country}
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

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
            {isEdit ? 'Salvar alterações' : 'Criar time'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
