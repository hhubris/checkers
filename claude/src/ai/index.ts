import type { Difficulty, GameState, Move } from '../types'
import { getRandomMove } from './random'
import { getHeuristicMove } from './heuristic'
import { getMinimaxMove } from './minimax'

export function getAIMove(state: GameState, difficulty: Difficulty): Move {
  switch (difficulty) {
    case 'easy':
      return getRandomMove(state)
    case 'medium':
      return getHeuristicMove(state)
    case 'hard':
      return getMinimaxMove(state)
  }
}
