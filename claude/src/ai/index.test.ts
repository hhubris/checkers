import { describe, it, expect } from 'vitest'
import { getAIMove } from './index'
import { createInitialGameState } from '../engine/gameState'
import { getLegalMoves } from '../engine/moves'
import type { Difficulty } from '../types'

const difficulties: Difficulty[] = ['easy', 'medium', 'hard']

describe('getAIMove', () => {
  for (const difficulty of difficulties) {
    it(`returns a legal move at difficulty "${difficulty}"`, () => {
      const state = createInitialGameState()
      // Use depth 2 for hard to keep tests fast; the minimax tests cover depth 8
      const move =
        difficulty === 'hard'
          ? getAIMove({ ...state }, difficulty)
          : getAIMove(state, difficulty)
      const legal = getLegalMoves(state.board, state.currentTurn)
      expect(legal.some((m) => m.from === move.from && m.to === move.to)).toBe(
        true,
      )
    })
  }
})
