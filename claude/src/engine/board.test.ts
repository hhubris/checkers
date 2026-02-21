import { describe, it, expect } from 'vitest'
import {
  createInitialBoard,
  cloneBoard,
  applyMove,
  getMoveDiagonals,
  jumpedSquare,
  isPromotionSquare,
  isOddRow,
} from './board'
import type { Move } from '../types'

const nsort = (arr: number[]) => [...arr].sort((a, b) => a - b)

describe('isOddRow', () => {
  it('identifies odd rows correctly', () => {
    expect(isOddRow(1)).toBe(true)   // row 1
    expect(isOddRow(4)).toBe(true)   // row 1
    expect(isOddRow(5)).toBe(false)  // row 2
    expect(isOddRow(8)).toBe(false)  // row 2
    expect(isOddRow(9)).toBe(true)   // row 3
    expect(isOddRow(12)).toBe(true)  // row 3
    expect(isOddRow(29)).toBe(false) // row 8
    expect(isOddRow(32)).toBe(false) // row 8
  })
})

describe('createInitialBoard', () => {
  it('places 12 black pieces on squares 1–12', () => {
    const board = createInitialBoard()
    for (let i = 1; i <= 12; i++) {
      expect(board[i]).toEqual({ color: 'black', isKing: false })
    }
  })

  it('places 12 red pieces on squares 21–32', () => {
    const board = createInitialBoard()
    for (let i = 21; i <= 32; i++) {
      expect(board[i]).toEqual({ color: 'red', isKing: false })
    }
  })

  it('leaves squares 13–20 empty', () => {
    const board = createInitialBoard()
    for (let i = 13; i <= 20; i++) {
      expect(board[i]).toBeNull()
    }
  })

  it('leaves index 0 null', () => {
    expect(createInitialBoard()[0]).toBeNull()
  })
})

describe('getMoveDiagonals', () => {
  // ── Odd row neighbors ──────────────────────────────────────────────
  it('sq 9 (odd, col 2): forward black → 13, 14', () => {
    expect(nsort(getMoveDiagonals(9, 'black', false))).toEqual([13, 14])
  })

  it('sq 11 (odd, col 6): forward black → 15, 16', () => {
    expect(nsort(getMoveDiagonals(11, 'black', false))).toEqual([15, 16])
  })

  it('sq 11 (odd, col 6): forward red (upper) → 7, 8', () => {
    expect(nsort(getMoveDiagonals(11, 'red', false))).toEqual([7, 8])
  })

  // ── Even row neighbors ─────────────────────────────────────────────
  it('sq 6 (even, col 3): forward black → 9, 10', () => {
    expect(nsort(getMoveDiagonals(6, 'black', false))).toEqual([9, 10])
  })

  it('sq 6 (even, col 3): forward red (upper) → 1, 2', () => {
    expect(nsort(getMoveDiagonals(6, 'red', false))).toEqual([1, 2])
  })

  // ── Left edge (even row, col 1) ────────────────────────────────────
  // Only right diagonal is valid; left goes to col 0 (off-board)
  it('sq 5 (even, col 1, left edge): forward black → 9 only', () => {
    expect(getMoveDiagonals(5, 'black', false)).toEqual([9])
  })

  it('sq 13 (even, col 1, left edge): forward black → 17 only', () => {
    expect(getMoveDiagonals(13, 'black', false)).toEqual([17])
  })

  // ── Right edge (odd row, col 8) ────────────────────────────────────
  // Only left diagonal is valid; right goes to col 9 (off-board)
  it('sq 4 (odd, col 8, right edge): forward black → 8 only', () => {
    expect(getMoveDiagonals(4, 'black', false)).toEqual([8])
  })

  it('sq 12 (odd, col 8, right edge): forward black → 16 only', () => {
    expect(getMoveDiagonals(12, 'black', false)).toEqual([16])
  })

  // ── Promotion rows: no forward moves ──────────────────────────────
  // Red's promotion row is row 1; going further 'upper' is off-board
  it('sq 1 (red promotion row, col 2): no forward red moves', () => {
    expect(getMoveDiagonals(1, 'red', false)).toEqual([])
  })

  it('sq 3 (red promotion row, col 6): no forward red moves', () => {
    expect(getMoveDiagonals(3, 'red', false)).toEqual([])
  })

  // Black's promotion row is row 8; sq 29 is col 1 (left edge) so
  // lower-right would be sq 33 (off-board)
  it('sq 29 (black promotion row, col 1): no forward black moves', () => {
    expect(getMoveDiagonals(29, 'black', false)).toEqual([])
  })

  it('sq 32 (black promotion row, col 7): no forward black moves', () => {
    expect(getMoveDiagonals(32, 'black', false)).toEqual([])
  })

  // ── Kings move in both directions ──────────────────────────────────
  it('sq 11 king: all four diagonals → 7, 8, 15, 16', () => {
    expect(nsort(getMoveDiagonals(11, 'black', true))).toEqual([7, 8, 15, 16])
  })

  it('sq 6 king: all four diagonals → 1, 2, 9, 10', () => {
    expect(nsort(getMoveDiagonals(6, 'black', true))).toEqual([1, 2, 9, 10])
  })
})

describe('jumpedSquare', () => {
  // ── From odd-row squares ───────────────────────────────────────────
  // sq 9 (odd, col 2) → jump upper-right over 6 → land 2 (diff -7)
  it('sq 9 → 2 (odd, jump upper-right): jumped = 6', () => {
    expect(jumpedSquare(9, 2)).toBe(6)
  })

  // sq 11 (odd, col 6) → jump upper-right over 8 → land 4 (diff -7)
  it('sq 11 → 4 (odd, jump upper-right): jumped = 8', () => {
    expect(jumpedSquare(11, 4)).toBe(8)
  })

  // sq 11 (odd, col 6) → jump upper-left over 7 → land 2 (diff -9)
  it('sq 11 → 2 (odd, jump upper-left): jumped = 7', () => {
    expect(jumpedSquare(11, 2)).toBe(7)
  })

  // sq 9 (odd, col 2) → jump lower-right over 14 → land 18 (diff +9)
  it('sq 9 → 18 (odd, jump lower-right): jumped = 14', () => {
    expect(jumpedSquare(9, 18)).toBe(14)
  })

  // sq 10 (odd, col 4) → jump lower-left over 14 → land 17 (diff +7)
  it('sq 10 → 17 (odd, jump lower-left): jumped = 14', () => {
    expect(jumpedSquare(10, 17)).toBe(14)
  })

  // ── From even-row squares ──────────────────────────────────────────
  // sq 6 (even, col 3) → jump lower-right over 10 → land 15 (diff +9)
  it('sq 6 → 15 (even, jump lower-right): jumped = 10', () => {
    expect(jumpedSquare(6, 15)).toBe(10)
  })

  // sq 6 (even, col 3) → jump lower-left over 9 → land 13 (diff +7)
  it('sq 6 → 13 (even, jump lower-left): jumped = 9', () => {
    expect(jumpedSquare(6, 13)).toBe(9)
  })

  // sq 14 (even, col 3) → jump upper-left over 9 → land 5 (diff -9)
  it('sq 14 → 5 (even, jump upper-left): jumped = 9', () => {
    expect(jumpedSquare(14, 5)).toBe(9)
  })

  // sq 14 (even, col 3) → jump upper-right over 10 → land 7 (diff -7)
  it('sq 14 → 7 (even, jump upper-right): jumped = 10', () => {
    expect(jumpedSquare(14, 7)).toBe(10)
  })
})

describe('isPromotionSquare', () => {
  it('squares 29-32 promote black', () => {
    for (let i = 29; i <= 32; i++) {
      expect(isPromotionSquare(i, 'black')).toBe(true)
    }
  })

  it('squares 1-4 promote red', () => {
    for (let i = 1; i <= 4; i++) {
      expect(isPromotionSquare(i, 'red')).toBe(true)
    }
  })

  it('non-promotion squares return false', () => {
    expect(isPromotionSquare(13, 'black')).toBe(false)
    expect(isPromotionSquare(20, 'red')).toBe(false)
  })
})

describe('cloneBoard', () => {
  it('returns a deep copy — mutating clone does not affect original', () => {
    const board = createInitialBoard()
    const clone = cloneBoard(board)
    clone[1] = null
    expect(board[1]).not.toBeNull()
  })
})

describe('applyMove', () => {
  it('moves a piece from → to', () => {
    const board = createInitialBoard()
    const move: Move = {
      from: 9,
      to: 14,
      captures: [],
      promotesToKing: false,
      path: [9, 14],
    }
    const next = applyMove(board, move)
    expect(next[9]).toBeNull()
    expect(next[14]).toEqual({ color: 'black', isKing: false })
  })

  it('clears captured squares', () => {
    const board = createInitialBoard()
    board[21] = null
    board[13] = { color: 'red', isKing: false }
    const move: Move = {
      from: 9,
      to: 18,
      captures: [13],
      promotesToKing: false,
      path: [9, 18],
    }
    const next = applyMove(board, move)
    expect(next[9]).toBeNull()
    expect(next[13]).toBeNull()
    expect(next[18]).toEqual({ color: 'black', isKing: false })
  })

  it('promotes a piece when promotesToKing is true', () => {
    const board = createInitialBoard()
    board[25] = { color: 'black', isKing: false }
    board[9] = null
    const move: Move = {
      from: 25,
      to: 29,
      captures: [],
      promotesToKing: true,
      path: [25, 29],
    }
    const next = applyMove(board, move)
    expect(next[29]).toEqual({ color: 'black', isKing: true })
  })

  it('does not mutate the original board', () => {
    const board = createInitialBoard()
    const move: Move = {
      from: 9,
      to: 14,
      captures: [],
      promotesToKing: false,
      path: [9, 14],
    }
    applyMove(board, move)
    expect(board[9]).toEqual({ color: 'black', isKing: false })
  })
})
