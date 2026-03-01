import { describe, it, expect } from 'vitest'
import { getRandomMove } from './random'
import { createInitialGameState } from '../engine/gameState'
import { getLegalMoves } from '../engine/moves'
import type { GameState } from '../types'

describe('getRandomMove', () => {
  it('returns a legal move from the initial position', () => {
    const state = createInitialGameState()
    const move = getRandomMove(state)
    const legal = getLegalMoves(state.board, state.currentTurn)
    expect(legal.some((m) => m.from === move.from && m.to === move.to)).toBe(
      true,
    )
  })

  it('throws when the game is over', () => {
    const state: GameState = {
      ...createInitialGameState(),
      status: 'red-wins',
    }
    expect(() => getRandomMove(state)).toThrow()
  })

  it('throws when there are no legal moves', () => {
    const state: GameState = {
      ...createInitialGameState(),
      board: new Array(33).fill(null), // no pieces
    }
    expect(() => getRandomMove(state)).toThrow()
  })
})
