import type { Color, GameState, HistoryEntry, Move } from '../types'
import { applyMove, createInitialBoard } from './board'
import { getLegalMoves } from './moves'
import { toNotation } from './notation'

// American checkers draw rule: 40 consecutive half-moves without a capture.
export const DRAW_MOVE_LIMIT = 40

export function createInitialGameState(): GameState {
  return {
    board: createInitialBoard(),
    currentTurn: 'black',
    moveHistory: [],
    status: 'playing',
    capturedByRed: 0,
    capturedByBlack: 0,
    movesSinceCapture: 0,
  }
}

export function opponent(color: Color): Color {
  return color === 'red' ? 'black' : 'red'
}

function detectStatus(
  state: GameState,
  nextTurn: Color,
): GameState['status'] {
  // Win: next player has no pieces remaining.
  const hasPieces = state.board.some(
    (p) => p !== null && p.color === nextTurn,
  )
  if (!hasPieces) {
    return nextTurn === 'black' ? 'red-wins' : 'black-wins'
  }

  // Win: next player has no legal moves.
  if (getLegalMoves(state.board, nextTurn).length === 0) {
    return nextTurn === 'black' ? 'red-wins' : 'black-wins'
  }

  // Draw: 40 consecutive half-moves without a capture.
  if (state.movesSinceCapture >= DRAW_MOVE_LIMIT) {
    return 'draw'
  }

  return 'playing'
}

export function applyMoveToState(state: GameState, move: Move): GameState {
  const nextBoard = applyMove(state.board, move)
  const nextTurn = opponent(state.currentTurn)
  const moveNumber =
    state.currentTurn === 'black'
      ? Math.floor(state.moveHistory.length / 2) + 1
      : Math.ceil(state.moveHistory.length / 2)

  const entry: HistoryEntry = {
    moveNumber,
    color: state.currentTurn,
    move,
    notation: toNotation(move),
  }

  const capturedByRed =
    state.capturedByRed +
    (state.currentTurn === 'red' ? move.captures.length : 0)
  const capturedByBlack =
    state.capturedByBlack +
    (state.currentTurn === 'black' ? move.captures.length : 0)

  const movesSinceCapture =
    move.captures.length > 0 ? 0 : state.movesSinceCapture + 1

  const partial: GameState = {
    board: nextBoard,
    currentTurn: nextTurn,
    moveHistory: [...state.moveHistory, entry],
    status: 'playing',
    capturedByRed,
    capturedByBlack,
    movesSinceCapture,
  }

  return { ...partial, status: detectStatus(partial, nextTurn) }
}
