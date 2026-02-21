import { describe, it, expect } from 'vitest'
import { evaluate } from './evaluation'
import type { Board } from '../types'

function sparse(pieces: [number, 'red' | 'black', boolean?][]): Board {
  const board: Board = new Array(33).fill(null)
  for (const [sq, color, isKing = false] of pieces) {
    board[sq] = { color, isKing }
  }
  return board
}

describe('evaluate', () => {
  it('returns 0 for an empty board (symmetric)', () => {
    const board = new Array(33).fill(null) as Board
    // Both sides have 0 material; score should be 0 for either color
    // (mobility will also be 0 since no moves exist)
    expect(evaluate(board, 'red')).toBeCloseTo(0)
    expect(evaluate(board, 'black')).toBeCloseTo(0)
  })

  it('scores positively for red when red has an extra piece', () => {
    // Red has 2 pieces, Black has 1 piece
    const board = sparse([[10, 'red'], [11, 'red'], [22, 'black']])
    expect(evaluate(board, 'red')).toBeGreaterThan(0)
    expect(evaluate(board, 'black')).toBeLessThan(0)
  })

  it('scores negatively for red when black has an extra piece', () => {
    const board = sparse([[10, 'black'], [11, 'black'], [22, 'red']])
    expect(evaluate(board, 'red')).toBeLessThan(0)
    expect(evaluate(board, 'black')).toBeGreaterThan(0)
  })

  it('a king is worth more than a regular piece', () => {
    const regularBoard = sparse([[10, 'red']])
    const kingBoard = sparse([[10, 'red', true]])
    expect(evaluate(kingBoard, 'red')).toBeGreaterThan(
      evaluate(regularBoard, 'red'),
    )
  })

  it('is symmetric: evaluate(board, red) === -evaluate(board, black) for equal-material boards', () => {
    const board = sparse([[10, 'red'], [22, 'black']])
    const redScore = evaluate(board, 'red')
    const blackScore = evaluate(board, 'black')
    expect(redScore).toBeCloseTo(-blackScore, 5)
  })
})
