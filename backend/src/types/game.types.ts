export interface Game {
  id: string
  name: string
}

export type CriarGame = Omit<Game, 'id'>

export type AtualizarGame = Partial<CriarGame> & Pick<Game, 'id'>
