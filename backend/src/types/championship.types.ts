export interface Championship {
  id: string
  name: string
  gameId: string
  startDate: Date
  endDate: Date | null
  prizePool: number | null
}

export type CriarChampionship = Omit<Championship, 'id'>

export type AtualizarChampionship = CriarChampionship & Pick<Championship, 'id'>
