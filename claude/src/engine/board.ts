import type { Board, Color, Move, Piece, SquareNumber } from '../types'

// Standard American checkers: 32 playable dark squares 1–32.
// Row 1 (Black's back rank) at top, Row 8 (Red's back rank) at bottom.
//
// Odd rows  (1,3,5,7): dark squares at cols 2,4,6,8
// Even rows (2,4,6,8): dark squares at cols 1,3,5,7
//
// Single-step diagonal offsets from square n:
//   Odd row  → upper-left: -4, upper-right: -3
//              lower-left: +4, lower-right: +5
//   Even row → upper-left: -5, upper-right: -4
//              lower-left: +3, lower-right: +4
//
// Edge guards (prevent row wrap-around):
//   Left edge  (col 1, even rows only): {5, 13, 21, 29} — no left moves
//   Right edge (col 8, odd rows only):  {4, 12, 20, 28} — no right moves

const LEFT_EDGE = new Set([5, 13, 21, 29])
const RIGHT_EDGE = new Set([4, 12, 20, 28])

// Black promotion squares (row 8); Red promotion squares (row 1)
const BLACK_PROMO = new Set([29, 30, 31, 32])
const RED_PROMO = new Set([1, 2, 3, 4])

export function isOddRow(square: SquareNumber): boolean {
  return Math.ceil(square / 4) % 2 === 1
}

function diagonalsInDir(
  square: SquareNumber,
  direction: 'upper' | 'lower',
): SquareNumber[] {
  const odd = isOddRow(square)
  const [leftOff, rightOff] =
    direction === 'upper'
      ? odd
        ? [-4, -3]
        : [-5, -4]
      : odd
        ? [4, 5]
        : [3, 4]

  const results: SquareNumber[] = []
  if (!LEFT_EDGE.has(square)) {
    const n = square + leftOff
    if (n >= 1 && n <= 32) results.push(n)
  }
  if (!RIGHT_EDGE.has(square)) {
    const n = square + rightOff
    if (n >= 1 && n <= 32) results.push(n)
  }
  return results
}

export function getMoveDiagonals(
  square: SquareNumber,
  color: Color,
  isKing: boolean,
): SquareNumber[] {
  const forward = color === 'black' ? 'lower' : 'upper'
  const backward = color === 'black' ? 'upper' : 'lower'
  const dirs = isKing ? [forward, backward] : [forward]
  return dirs.flatMap((d) => diagonalsInDir(square, d))
}

// Returns the square the jumping piece passes OVER (the captured square).
// `from` and `to` are the start and landing squares of a single jump.
export function jumpedSquare(
  from: SquareNumber,
  to: SquareNumber,
): SquareNumber {
  const odd = isOddRow(from)
  const diff = to - from
  if (odd) {
    if (diff === -9) return from - 4
    if (diff === -7) return from - 3
    if (diff === 7) return from + 4
    if (diff === 9) return from + 5
  } else {
    if (diff === -9) return from - 5
    if (diff === -7) return from - 4
    if (diff === 7) return from + 3
    if (diff === 9) return from + 4
  }
  throw new Error(`Invalid jump: ${from} → ${to}`)
}

export function isPromotionSquare(
  square: SquareNumber,
  color: Color,
): boolean {
  return color === 'black'
    ? BLACK_PROMO.has(square)
    : RED_PROMO.has(square)
}

export function createInitialBoard(): Board {
  const board: Board = new Array(33).fill(null)
  for (let i = 1; i <= 12; i++) board[i] = { color: 'black', isKing: false }
  for (let i = 21; i <= 32; i++) board[i] = { color: 'red', isKing: false }
  return board
}

export function cloneBoard(board: Board): Board {
  return board.map((p) => (p ? { ...p } : null))
}

export function applyMove(board: Board, move: Move): Board {
  const next = cloneBoard(board)
  const piece = next[move.from] as Piece
  next[move.from] = null
  for (const cap of move.captures) next[cap] = null
  next[move.to] = move.promotesToKing
    ? { color: piece.color, isKing: true }
    : { ...piece }
  return next
}
