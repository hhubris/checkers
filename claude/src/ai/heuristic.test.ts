import { describe, it, expect } from 'vitest'
import { getHeuristicMove } from './heuristic'
import { createInitialGameState } from '../engine/gameState'
import { getLegalMoves } from '../engine/moves'
import type { Board, GameState } from '../types'

function sparse(pieces: [number, 'red' | 'black', boolean?][]): Board {
  const board: Board = new Array(33).fill(null)
  for (const [sq, color, isKing = false] of pieces) {
    board[sq] = { color, isKing }
  }
  return board
}

function state(board: Board, turn: GameState['currentTurn'] = 'black'): GameState {
  return {
    board,
    currentTurn: turn,
    moveHistory: [],
    status: 'playing',
    capturedByRed: 0,
    capturedByBlack: 0,
  }
}

describe('getHeuristicMove', () => {
  it('returns a legal move from the initial position', () => {
    const s = createInitialGameState()
    const move = getHeuristicMove(s)
    const legal = getLegalMoves(s)
    expect(legal.some((m) => m.from === move.from && m.to === move.to)).toBe(true)
  })

  it('prefers a capture move when one is available (mandatory jump)', () => {
    // Black on 11, red on 15 (capturable); black MUST jump
    const board = sparse([[11, 'black'], [15, 'red']])
    const move = getHeuristicMove(state(board, 'black'))
    expect(move.captures.length).toBeGreaterThan(0)
  })

  it('prefers a kinging move over a non-kinging move', () => {
    // Black on sq 25 (odd, row 7): lower-left=29 (promo), lower-right=30 (promo)
    // Black on sq 9 (odd, row 3): lower-left=13, lower-right=14 (no promo)
    const board2 = sparse([[25, 'black'], [9, 'black']])
    const move2 = getHeuristicMove(state(board2, 'black'))
    // Heuristic should prefer the promoting move
    expect(move2.promotesToKing).toBe(true)
  })

  it('throws when the game is over', () => {
    const s: GameState = { ...createInitialGameState(), status: 'red-wins' }
    expect(() => getHeuristicMove(s)).toThrow()
  })
})
