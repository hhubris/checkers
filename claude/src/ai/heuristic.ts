import type { GameState, Move } from '../types'
import { getLegalMoves } from '../engine/moves'
import { applyMove } from '../engine/board'
import { evaluate } from './evaluation'

export function getHeuristicMove(state: GameState): Move {
  if (state.status !== 'playing') {
    throw new Error('getHeuristicMove called on a finished game')
  }
  const moves = getLegalMoves(state)
  if (moves.length === 0) {
    throw new Error('getHeuristicMove called with no legal moves')
  }

  let bestMove = moves[0]!
  let bestScore = -Infinity

  for (const move of moves) {
    const nextBoard = applyMove(state.board, move)
    const score = evaluate(nextBoard, state.currentTurn)
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }

  return bestMove
}
