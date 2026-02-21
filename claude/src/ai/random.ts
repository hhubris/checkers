import type { GameState, Move } from '../types'
import { getLegalMoves } from '../engine/moves'

export function getRandomMove(state: GameState): Move {
  if (state.status !== 'playing') {
    throw new Error('getRandomMove called on a finished game')
  }
  const moves = getLegalMoves(state)
  if (moves.length === 0) {
    throw new Error('getRandomMove called with no legal moves')
  }
  return moves[Math.floor(Math.random() * moves.length)]!
}
