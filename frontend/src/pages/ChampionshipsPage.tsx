import { useCallback, useEffect, useState } from 'react'

import { ChampionshipFormDialog } from '../components/ChampionshipFormDialog'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { IconPencil, IconPlus, IconRefresh, IconTrash } from '../components/Icons'
import { LoadError } from '../components/LoadError'
import { LoadingList } from '../components/LoadingList'
import { MatchFormDialog } from '../components/MatchFormDialog'
import { Notice } from '../components/Notice'
import { PageHeader } from '../components/PageHeader'
import { TeamLogo } from '../components/TeamLogo'
import {
  createChampionship,
  createMatch,
  deleteChampionship,
  deleteMatch,
  imageUrl,
  listChampionships,
  listGames,
  listTeams,
  updateChampionship,
  updateMatch,
} from '../lib/api'
import { cn, formatCurrency, formatDate, formatDateTime } from '../lib/format'
import { iconButtonClass, primaryButtonClass, secondaryButtonClass } from '../lib/styles'
import { useNotice } from '../lib/useNotice'
import type {
  Championship,
  ChampionshipInput,
  ChampionshipMatch,
  Game,
  MatchInput,
  MatchStatus,
  Team,
} from '../types'

type LoadState = 'loading' | 'ready' | 'error'
type FormState = { mode: 'create' } | { mode: 'edit'; championship: Championship } | null
type MatchFormState = { championship: Championship; match: ChampionshipMatch | null } | null
type DeleteState = Championship | null
type DeleteMatchState = { championship: Championship; match: ChampionshipMatch } | null

const matchGroups: Array<{ status: MatchStatus; label: string }> = [
  { status: 'LIVE', label: 'Em andamento' },
  { status: 'SCHEDULED', label: 'Próximas' },
  { status: 'FINISHED', label: 'Encerradas' },
]

function sortMatches(matches: ChampionshipMatch[]) {
  return [...matches].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  )
}

export function ChampionshipsPage() {
  const [championships, setChampionships] = useState<Championship[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [form, setForm] = useState<FormState>(null)
  const [matchForm, setMatchForm] = useState<MatchFormState>(null)
  const [deleting, setDeleting] = useState<DeleteState>(null)
  const [deletingMatch, setDeletingMatch] = useState<DeleteMatchState>(null)
  const [notice, setNotice] = useNotice()

  const load = useCallback(async (mode: 'initial' | 'refresh') => {
    if (mode === 'initial') setLoadState('loading')
    else setRefreshing(true)

    setError(null)

    try {
      const [championshipList, gameList, teamList] = await Promise.all([
        listChampionships(),
        listGames(),
        listTeams(),
      ])

      setChampionships(championshipList)
      setGames(gameList)
      setTeams(teamList)
      setLoadState('ready')
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Erro ao carregar campeonatos.'

      setError(message)
      setLoadState((current) => (current === 'ready' ? 'ready' : 'error'))
    } finally {
      if (mode === 'refresh') setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void load('initial')
  }, [load])

  async function handleSaveChampionship(input: ChampionshipInput) {
    if (form?.mode === 'edit') {
      const updated = await updateChampionship(form.championship.id, input)

      setChampionships((previous) =>
        previous.map((item) => (item.id === updated.id ? updated : item)),
      )
      setNotice(`${updated.name} foi atualizado.`)

      return
    }

    const created = await createChampionship(input)

    setChampionships((previous) => [created, ...previous])
    setNotice(`${created.name} foi criado.`)
  }

  async function handleSaveMatch(input: MatchInput) {
    const target = matchForm

    if (!target) return

    if (target.match) {
      const updated = await updateMatch(target.match.id, input)

      setChampionships((previous) =>
        previous.map((item) =>
          item.id === target.championship.id
            ? {
                ...item,
                matches: sortMatches(
                  item.matches.map((match) => (match.id === updated.id ? updated : match)),
                ),
              }
            : item,
        ),
      )
      setNotice('Partida atualizada.')

      return
    }

    const created = await createMatch(input)

    setChampionships((previous) =>
      previous.map((item) =>
        item.id === created.championshipId
          ? { ...item, matches: sortMatches([...item.matches, created]) }
          : item,
      ),
    )
    setNotice('Partida adicionada.')
  }

  async function handleDeleteChampionship() {
    if (!deleting) return

    await deleteChampionship(deleting.id)
    setChampionships((previous) => previous.filter((item) => item.id !== deleting.id))
    setNotice(`${deleting.name} foi removido.`)
  }

  async function handleDeleteMatch() {
    if (!deletingMatch) return

    await deleteMatch(deletingMatch.match.id)
    setChampionships((previous) =>
      previous.map((item) =>
        item.id === deletingMatch.championship.id
          ? {
              ...item,
              matches: item.matches.filter((match) => match.id !== deletingMatch.match.id),
            }
          : item,
      ),
    )
    setNotice('Partida removida.')
  }

  const canCreate = loadState === 'ready' && games.length > 0
  const totalMatches = championships.reduce((total, item) => total + item.matches.length, 0)

  const description =
    loadState === 'ready' && championships.length > 0
      ? `${championships.length} ${
          championships.length === 1 ? 'campeonato' : 'campeonatos'
        } · ${totalMatches} ${totalMatches === 1 ? 'partida' : 'partidas'}.`
      : 'Campeonatos previstos, partidas em andamento e resultados.'

  return (
    <>
      <PageHeader title="Campeonatos" description={description}>
        <button
          type="button"
          onClick={() => void load('refresh')}
          disabled={refreshing || loadState === 'loading'}
          className={secondaryButtonClass}
        >
          <IconRefresh className={cn('size-4', refreshing && 'animate-spin')} />
          <span className="hidden sm:inline">{refreshing ? 'Atualizando' : 'Atualizar'}</span>
          <span className="sr-only sm:hidden">Atualizar lista</span>
        </button>

        <button
          type="button"
          onClick={() => setForm({ mode: 'create' })}
          disabled={!canCreate}
          title={
            loadState === 'ready' && games.length === 0 ? 'Cadastre um jogo primeiro' : undefined
          }
          className={primaryButtonClass}
        >
          <IconPlus className="size-4" />
          Adicionar campeonato
        </button>
      </PageHeader>

      <Notice message={notice} className="mt-4" />

      {loadState === 'ready' && games.length === 0 && (
        <p className="mt-4 border border-line bg-surface px-3 py-2 text-[13px] text-muted">
          Nenhum jogo cadastrado.{' '}
          <a
            href="#/jogos"
            className="font-medium text-ink underline decoration-line-strong underline-offset-4 transition hover:decoration-accent"
          >
            Cadastre um jogo
          </a>{' '}
          antes de criar campeonatos.
        </p>
      )}

      {error && loadState === 'ready' && (
        <p
          role="status"
          className="mt-4 border border-line bg-surface px-3 py-2 text-[13px] text-muted"
        >
          A lista pode estar desatualizada: {error}
        </p>
      )}

      {loadState === 'loading' && (
        <>
          <LoadingList />
          <p role="status" className="sr-only">
            Carregando campeonatos
          </p>
        </>
      )}

      {loadState === 'error' && (
        <LoadError
          message={error ?? 'Erro ao carregar campeonatos.'}
          onRetry={() => void load('initial')}
        />
      )}

      {loadState === 'ready' && championships.length === 0 && (
        <div className="mt-6 rounded-lg border border-dashed border-neutral-300 bg-surface px-6 py-16 text-center">
          <h2 className="text-base font-semibold">Nenhum campeonato cadastrado</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted">
            Crie um campeonato e registre as partidas previstas, em andamento e já jogadas.
          </p>
          <button
            type="button"
            onClick={() => setForm({ mode: 'create' })}
            disabled={!canCreate}
            className={cn(primaryButtonClass, 'mt-6')}
          >
            <IconPlus className="size-4" />
            Adicionar campeonato
          </button>
        </div>
      )}

      {loadState === 'ready' && championships.length > 0 && (
        <div className="mt-6 space-y-4">
          {championships.map((championship) => {
            const period = championship.endDate
              ? `${formatDate(championship.startDate)} – ${formatDate(championship.endDate)}`
              : `A partir de ${formatDate(championship.startDate)}`

            return (
              <section
                key={championship.id}
                aria-labelledby={`championship-${championship.id}`}
                className="overflow-hidden rounded-lg border border-line bg-surface"
              >
                <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3.5">
                  <div className="min-w-0">
                    <h2
                      id={`championship-${championship.id}`}
                      className="truncate text-base font-semibold tracking-tight"
                    >
                      {championship.name}
                    </h2>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
                      <span className="inline-block max-w-40 truncate rounded border border-line bg-neutral-50 px-1.5 py-0.5">
                        {championship.game.name}
                      </span>
                      <span className="tabular-nums">{period}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {championship.matches.length}{' '}
                        {championship.matches.length === 1 ? 'partida' : 'partidas'}
                      </span>
                      {championship.prizePool ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-ink">
                            {formatCurrency(championship.prizePool)}
                          </span>
                        </>
                      ) : null}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setMatchForm({ championship, match: null })}
                      className={cn(secondaryButtonClass, 'h-9 px-3 text-[13px]')}
                    >
                      <IconPlus className="size-3.5" />
                      Partida
                    </button>

                    <button
                      type="button"
                      onClick={() => setForm({ mode: 'edit', championship })}
                      aria-label={`Editar ${championship.name}`}
                      title="Editar campeonato"
                      className={iconButtonClass}
                    >
                      <IconPencil className="size-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleting(championship)}
                      aria-label={`Excluir ${championship.name}`}
                      title="Excluir campeonato"
                      className={iconButtonClass}
                    >
                      <IconTrash className="size-4" />
                    </button>
                  </div>
                </header>

                <div className="px-4 py-3">
                  {championship.matches.length === 0 ? (
                    <p className="py-2 text-[13px] text-muted">
                      Nenhuma partida cadastrada. Adicione uma partida e escolha times do sistema ou
                      times externos.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {matchGroups.map((group) => {
                        const matches = championship.matches.filter(
                          (match) => match.status === group.status,
                        )

                        if (matches.length === 0) return null

                        return (
                          <div key={group.status}>
                            <h3 className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
                              {group.label}
                              {group.status === 'LIVE' && (
                                <span className="size-1.5 rounded-full bg-accent" />
                              )}
                              <span className="font-normal normal-case tracking-normal">
                                ({matches.length})
                              </span>
                            </h3>

                            <ul className="mt-2 divide-y divide-line rounded-md border border-line">
                              {matches.map((match) => (
                                <li
                                  key={match.id}
                                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 py-2.5"
                                >
                                  <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                                    <span className="flex min-w-0 items-center gap-1.5">
                                      <TeamLogo
                                        name={match.homeTeam.name}
                                        src={imageUrl(match.homeTeam.logo)}
                                        size="sm"
                                      />
                                      <span className="truncate text-[13px] font-medium">
                                        {match.homeTeam.name}
                                      </span>
                                    </span>

                                    <span className="text-[10px] uppercase tracking-[0.08em] text-muted">
                                      vs
                                    </span>

                                    <span className="flex min-w-0 items-center gap-1.5">
                                      <TeamLogo
                                        name={match.awayTeam.name}
                                        src={imageUrl(match.awayTeam.logo)}
                                        size="sm"
                                      />
                                      <span className="truncate text-[13px] font-medium">
                                        {match.awayTeam.name}
                                      </span>
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    {match.status !== 'SCHEDULED' && (
                                      <span className="mr-1 tabular-nums text-sm font-medium">
                                        {match.homeScore ?? 0}
                                        <span className="mx-1 text-muted">–</span>
                                        {match.awayScore ?? 0}
                                      </span>
                                    )}

                                    <span className="whitespace-nowrap text-[11px] tabular-nums text-muted">
                                      {formatDateTime(match.scheduledAt)}
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() => setMatchForm({ championship, match })}
                                      aria-label={`Editar partida entre ${match.homeTeam.name} e ${match.awayTeam.name}`}
                                      title="Editar partida"
                                      className={iconButtonClass}
                                    >
                                      <IconPencil className="size-4" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setDeletingMatch({ championship, match })}
                                      aria-label={`Excluir partida entre ${match.homeTeam.name} e ${match.awayTeam.name}`}
                                      title="Excluir partida"
                                      className={iconButtonClass}
                                    >
                                      <IconTrash className="size-4" />
                                    </button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {form && (
        <ChampionshipFormDialog
          championship={form.mode === 'edit' ? form.championship : null}
          games={games}
          onClose={() => setForm(null)}
          onSubmit={handleSaveChampionship}
        />
      )}

      {matchForm && (
        <MatchFormDialog
          championship={matchForm.championship}
          match={matchForm.match}
          teams={teams}
          onClose={() => setMatchForm(null)}
          onSubmit={handleSaveMatch}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Excluir campeonato?"
          description={
            <>
              O campeonato <span className="font-medium text-ink">{deleting.name}</span> será
              removido junto com {deleting.matches.length}{' '}
              {deleting.matches.length === 1 ? 'partida' : 'partidas'}.
            </>
          }
          confirmLabel="Excluir campeonato"
          errorFallback="Não foi possível excluir o campeonato."
          onClose={() => setDeleting(null)}
          onConfirm={handleDeleteChampionship}
        />
      )}

      {deletingMatch && (
        <ConfirmDialog
          title="Excluir partida?"
          description={
            <>
              A partida entre{' '}
              <span className="font-medium text-ink">{deletingMatch.match.homeTeam.name}</span> e{' '}
              <span className="font-medium text-ink">{deletingMatch.match.awayTeam.name}</span> será
              removida.
            </>
          }
          confirmLabel="Excluir partida"
          errorFallback="Não foi possível excluir a partida."
          onClose={() => setDeletingMatch(null)}
          onConfirm={handleDeleteMatch}
        />
      )}
    </>
  )
}
