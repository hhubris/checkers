import type { GameState, Move, Color } from '../types'
import { getLegalMoves } from '../engine/moves'
import { applyMove } from '../engine/board'
import { evaluate } from './evaluation'

function opponent(color: Color): Color {
  return color === 'red' ? 'black' : 'red'
}

// Returns score from `maximizingColor`'s perspective.
function minimax(
  board: GameState['board'],
  currentTurn: Color,
  maximizingColor: Color,
  depth: number,
  alpha: number,
  beta: number,
): number {
  const state: GameState = {
    board,
    currentTurn,
    moveHistory: [],
    status: 'playing',
    capturedByRed: 0,
    capturedByBlack: 0,
    movesSinceCapture: 0,
  }
  const moves = getLegalMoves(state)

  // Terminal: no moves or leaf node
  if (moves.length === 0 || depth === 0) {
    return evaluate(board, maximizingColor)
  }

  if (currentTurn === maximizingColor) {
    let maxScore = -Infinity
    for (const move of moves) {
      const nextBoard = applyMove(board, move)
      const score = minimax(
        nextBoard,
        opponent(currentTurn),
        maximizingColor,
        depth - 1,
        alpha,
        beta,
      )
      if (score > maxScore) maxScore = score
      if (maxScore > alpha) alpha = maxScore
      if (alpha >= beta) break
    }
    return maxScore
  } else {
    let minScore = Infinity
    for (const move of moves) {
      const nextBoard = applyMove(board, move)
      const score = minimax(
        nextBoard,
        opponent(currentTurn),
        maximizingColor,
        depth - 1,
        alpha,
        beta,
      )
      if (score < minScore) minScore = score
      if (minScore < beta) beta = minScore
      if (alpha >= beta) break
    }
    return minScore
  }
}

export function getMinimaxMove(state: GameState, depth = 8): Move {
  if (state.status !== 'playing') {
    throw new Error('getMinimaxMove called on a finished game')
  }
  const moves = getLegalMoves(state)
  if (moves.length === 0) {
    throw new Error('getMinimaxMove called with no legal moves')
  }

  let bestMove = moves[0]!
  let bestScore = -Infinity

  for (const move of moves) {
    const nextBoard = applyMove(state.board, move)
    const score = minimax(
      nextBoard,
      opponent(state.currentTurn),
      state.currentTurn,
      depth - 1,
      -Infinity,
      Infinity,
    )
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }

  return bestMove
}
