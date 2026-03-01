import { describe, it, expect } from 'vitest'
import { getSimpleMoves, getJumpsFrom, getLegalMoves } from './moves'
import { createInitialBoard } from './board'
import type { Board } from '../types'

// Build a sparse board from a descriptor array of [square, color, isKing]
function sparse(
  pieces: [number, 'red' | 'black', boolean?][],
): Board {
  const board: Board = new Array(33).fill(null)
  for (const [sq, color, isKing = false] of pieces) {
    board[sq] = { color, isKing }
  }
  return board
}

// ── getSimpleMoves ────────────────────────────────────────────────────

describe('getSimpleMoves', () => {
  it('returns empty for an empty square', () => {
    const board = createInitialBoard()
    expect(getSimpleMoves(board, 15)).toEqual([])
  })

  it('black piece on sq 11 can move to 15 and 16', () => {
    const board = sparse([[11, 'black']])
    const moves = getSimpleMoves(board, 11)
    const tos = moves.map((m) => m.to).sort((a, b) => a - b)
    expect(tos).toEqual([15, 16])
  })

  it('red piece on sq 22 can move to 17 and 18', () => {
    const board = sparse([[22, 'red']])
    const moves = getSimpleMoves(board, 22)
    const tos = moves.map((m) => m.to).sort((a, b) => a - b)
    expect(tos).toEqual([17, 18])
  })

  it('blocked destination is excluded', () => {
    const board = sparse([[11, 'black'], [15, 'black']])
    const moves = getSimpleMoves(board, 11)
    expect(moves.map((m) => m.to)).toEqual([16])
  })

  it('marks promotesToKing when landing on promotion row', () => {
    // Black piece one step from row 8
    const board = sparse([[25, 'black']])
    const moves = getSimpleMoves(board, 25)
    const promoting = moves.filter((m) => m.promotesToKing)
    expect(promoting.length).toBeGreaterThan(0)
    expect(promoting.every((m) => m.to >= 29 && m.to <= 32)).toBe(true)
  })

  it('king can move backward', () => {
    const board = sparse([[15, 'black', true]])
    const moves = getSimpleMoves(board, 15)
    const tos = moves.map((m) => m.to).sort((a, b) => a - b)
    // 15 is even row (row 4). upper: 10,11; lower: 18,19
    expect(tos).toEqual([10, 11, 18, 19])
  })
})

// ── getJumpsFrom ──────────────────────────────────────────────────────

describe('getJumpsFrom', () => {
  it('returns empty when no enemy piece is adjacent', () => {
    const board = sparse([[11, 'black']])
    expect(getJumpsFrom(board, 11)).toEqual([])
  })

  it('returns empty when enemy piece has no empty landing square', () => {
    // Black on 11, red on 15, black on 18 (blocking the landing)
    const board = sparse([[11, 'black'], [15, 'red'], [18, 'black']])
    expect(getJumpsFrom(board, 11)).toEqual([])
  })

  it('single jump: black on 11 jumps red on 15 to land on 18', () => {
    const board = sparse([[11, 'black'], [15, 'red']])
    const jumps = getJumpsFrom(board, 11)
    expect(jumps).toHaveLength(1)
    expect(jumps[0]).toMatchObject({ from: 11, to: 18, captures: [15] })
  })

  it('single jump: red on 22 jumps black on 18 to land on 15', () => {
    const board = sparse([[22, 'red'], [18, 'black']])
    const jumps = getJumpsFrom(board, 22)
    expect(jumps).toHaveLength(1)
    expect(jumps[0]).toMatchObject({ from: 22, to: 15, captures: [18] })
  })

  it('multi-jump: expands the full sequence', () => {
    // Black on 11 (odd, col 6):
    //   jump over red 15 (even, col 5) → land 18 (odd, col 4)
    //   jump over red 22 (even, col 3) → land 25 (odd, col 2)
    const board = sparse([[11, 'black'], [15, 'red'], [22, 'red']])
    const jumps = getJumpsFrom(board, 11)
    const hit = jumps.find((m) => m.to === 25)
    expect(hit).toBeDefined()
    expect(hit?.captures.sort((a, b) => a - b)).toEqual([15, 22])
  })

  it('piece cannot revisit a square in a multi-jump', () => {
    // Set up a board where backtracking would loop — ensure no infinite loop
    const board = sparse([
      [15, 'black'],
      [18, 'red'],
      [22, 'red'],
    ])
    // Should complete without hanging
    const jumps = getJumpsFrom(board, 15)
    expect(Array.isArray(jumps)).toBe(true)
  })

  it('marks promotesToKing when jump lands on promotion row', () => {
    // Black on 22 (even, col 3) jumps red on 25 (odd, col 2) → lands on 29
    // (row 8, black's promotion row). sq 25 is NOT left-edge so the step
    // from 25→29 is valid (odd lower-left offset = +4).
    const board = sparse([[22, 'black'], [25, 'red']])
    const jumps = getJumpsFrom(board, 22)
    const promo = jumps.find((m) => m.to === 29)
    expect(promo?.promotesToKing).toBe(true)
  })

  it('king can jump backward', () => {
    // Red king on 15, black piece on 18 (diagonally below), landing on 22
    const board = sparse([[15, 'red', true], [18, 'black']])
    const jumps = getJumpsFrom(board, 15)
    expect(jumps.some((m) => m.to === 22)).toBe(true)
  })

  it('jump that kings a piece ends the sequence immediately', () => {
    // Black on 23 (even, row 6) jumps red on 26 → lands on 30 (promotion).
    // Red on 25 sits one step back from 30, reachable only by a king moving
    // backward. The sequence must stop at 30; the red on 25 must NOT be
    // included as a continuation.
    const board = sparse([[23, 'black'], [26, 'red'], [25, 'red']])
    const jumps = getJumpsFrom(board, 23)
    expect(jumps).toHaveLength(1)
    expect(jumps[0]).toMatchObject({ to: 30, captures: [26], promotesToKing: true })
  })
})

// ── getLegalMoves ─────────────────────────────────────────────────────

describe('getLegalMoves', () => {
  it('returns simple moves when no jumps exist', () => {
    const board = createInitialBoard()
    // Remove all Black pieces except sq 9; no red within jump range
    for (let i = 1; i <= 12; i++) board[i] = null
    board[9] = { color: 'black', isKing: false }
    const moves = getLegalMoves(board, 'black')
    expect(moves.every((m) => m.captures.length === 0)).toBe(true)
  })

  it('mandatory jump: returns only jumps when a jump is available', () => {
    // Black on 11, red on 15 (capturable), red on 20 (not involved)
    const board = sparse([[11, 'black'], [15, 'red'], [20, 'red']])
    const moves = getLegalMoves(board, 'black')
    expect(moves.every((m) => m.captures.length > 0)).toBe(true)
  })

  it('mandatory jump includes jumps from ALL pieces with a jump', () => {
    // Black 9 jumps red 14 → lands 18 (sq 14 not an edge, step valid)
    // Black 11 jumps red 16 → lands 20 (sq 16 not an edge, step valid)
    const board = sparse([
      [9, 'black'], [14, 'red'],
      [11, 'black'], [16, 'red'],
    ])
    const moves = getLegalMoves(board, 'black')
    const froms = [...new Set(moves.map((m) => m.from))].sort((a, b) => a - b)
    expect(froms).toEqual([9, 11])
  })

  it('returns empty when current player has no pieces', () => {
    const board = sparse([[15, 'red']])
    expect(getLegalMoves(board, 'black')).toEqual([])
  })
})
