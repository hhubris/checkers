export type Color = 'red' | 'black'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type GameStatus = 'playing' | 'red-wins' | 'black-wins'
export type PlayMode = 'hvh' | 'hva' | 'ava'
export type PlayerType = 'human' | 'ai'
export type ThemeId = 'classic' | 'ocean'

// Square numbers 1–32 (dark squares only, standard American
// checkers numbering: row 1 top-left, row 8 bottom-right)
export type SquareNumber = number

export interface Piece {
  color: Color
  isKing: boolean
}

// Index 0 unused; indices 1–32 represent playable squares
export type Board = (Piece | null)[]

export interface Move {
  from: SquareNumber
  to: SquareNumber
  // Squares cleared during jump(s); empty for simple moves
  captures: SquareNumber[]
  promotesToKing: boolean
  // Full sequence of squares occupied during the move, including
  // from and to. Length > 2 indicates a multi-jump.
  // e.g. [11, 18, 25] for a double jump landing at 25 via 18.
  path: SquareNumber[]
}

export interface HistoryEntry {
  moveNumber: number
  color: Color
  move: Move
  notation: string
}

export interface GameState {
  board: Board
  currentTurn: Color
  moveHistory: HistoryEntry[]
  status: GameStatus
  capturedByRed: number
  capturedByBlack: number
}

export interface UIState {
  selectedSquare: SquareNumber | null
  validMovesForSelected: Move[]
  hintedMoves: Move[]
  isAIThinking: boolean
  lastMove: Move | null
}
