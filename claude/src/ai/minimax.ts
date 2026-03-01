import type { GameState, Move, Color } from '../types'
import { getLegalMoves } from '../engine/moves'
import { applyMove } from '../engine/board'
import { opponent, DRAW_MOVE_LIMIT } from '../engine/gameState'
import { evaluate } from './evaluation'

// Returns score from `maximizingColor`'s perspective.
function minimax(
  board: GameState['board'],
  currentTurn: Color,
  maximizingColor: Color,
  depth: number,
  alpha: number,
  beta: number,
  movesSinceCapture: number,
): number {
  // Draw: 40 consecutive half-moves without a capture.
  if (movesSinceCapture >= DRAW_MOVE_LIMIT) return 0

  const state: GameState = {
    board,
    currentTurn,
    moveHistory: [],
    status: 'playing',
    capturedByRed: 0,
    capturedByBlack: 0,
    movesSinceCapture,
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
      const nextMSC = move.captures.length > 0 ? 0 : movesSinceCapture + 1
      const score = minimax(
        nextBoard,
        opponent(currentTurn),
        maximizingColor,
        depth - 1,
        alpha,
        beta,
        nextMSC,
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
      const nextMSC = move.captures.length > 0 ? 0 : movesSinceCapture + 1
      const score = minimax(
        nextBoard,
        opponent(currentTurn),
        maximizingColor,
        depth - 1,
        alpha,
        beta,
        nextMSC,
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

  let bestScore = -Infinity
  const topMoves: Move[] = []

  for (const move of moves) {
    const nextBoard = applyMove(state.board, move)
    const nextMSC = move.captures.length > 0 ? 0 : state.movesSinceCapture + 1
    const score = minimax(
      nextBoard,
      opponent(state.currentTurn),
      state.currentTurn,
      depth - 1,
      -Infinity,
      Infinity,
      nextMSC,
    )
    if (score > bestScore) {
      bestScore = score
      topMoves.length = 0
      topMoves.push(move)
    } else if (score === bestScore) {
      topMoves.push(move)
    }
  }

  return topMoves[Math.floor(Math.random() * topMoves.length)]!
}
