import { describe, it, expect } from 'vitest'
import { getMinimaxMove } from './minimax'
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

describe('getMinimaxMove', () => {
  it('returns a legal move from the initial position', () => {
    const s = createInitialGameState()
    // Depth 2 to keep test fast
    const move = getMinimaxMove(s, 2)
    const legal = getLegalMoves(s)
    expect(legal.some((m) => m.from === move.from && m.to === move.to)).toBe(true)
  })

  it('does not return an illegal move', () => {
    const s = createInitialGameState()
    const move = getMinimaxMove(s, 2)
    const legal = getLegalMoves(s)
    const found = legal.find((m) => m.from === move.from && m.to === move.to)
    expect(found).toBeDefined()
  })

  it('recognizes a forced win in 1 move (captures the last black piece)', () => {
    // Red king on 15, only one black piece on 18 which can be jumped to 22
    const board = sparse([[15, 'red', true], [18, 'black']])
    const s = state(board, 'red')
    const move = getMinimaxMove(s, 2)
    // The winning move is the jump that captures black's last piece
    expect(move.captures).toContain(18)
  })

  it('completes within 5 seconds for a typical mid-game at depth 8', () => {
    // Mid-game position
    const board = sparse([
      [9, 'black'], [10, 'black'], [11, 'black'],
      [14, 'black'], [15, 'black'],
      [18, 'red'], [19, 'red'], [20, 'red'],
      [23, 'red'], [24, 'red'],
    ])
    const s = state(board, 'black')
    const start = Date.now()
    getMinimaxMove(s, 8)
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(5000)
  }, 10000)

  it('throws when the game is over', () => {
    const s: GameState = { ...createInitialGameState(), status: 'red-wins' }
    expect(() => getMinimaxMove(s)).toThrow()
  })
})
