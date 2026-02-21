import { describe, it, expect } from 'vitest'
import { toNotation } from './notation'
import type { Move } from '../types'

function move(
  from: number,
  to: number,
  captures: number[],
  path: number[],
): Move {
  return { from, to, captures, path, promotesToKing: false }
}

describe('toNotation', () => {
  it('simple move: "11-15"', () => {
    expect(toNotation(move(11, 15, [], [11, 15]))).toBe('11-15')
  })

  it('single jump: "11x18"', () => {
    expect(toNotation(move(11, 18, [15], [11, 18]))).toBe('11x18')
  })

  it('double jump: "11x18x25"', () => {
    expect(toNotation(move(11, 25, [15, 22], [11, 18, 25]))).toBe('11x18x25')
  })

  it('triple jump: "11x18x25x32"', () => {
    expect(
      toNotation(move(11, 32, [15, 22, 29], [11, 18, 25, 32])),
    ).toBe('11x18x25x32')
  })

  it('uses x separator only for jumps, not simple moves', () => {
    const notation = toNotation(move(1, 5, [], [1, 5]))
    expect(notation).not.toContain('x')
    expect(notation).toContain('-')
  })
})
