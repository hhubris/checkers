import type { Board, Color, SquareNumber } from '../types'
import { getLegalMoves } from '../engine/moves'

// Center squares bonus (inner 7 squares near the board center)
const CENTER_SQUARES = new Set<SquareNumber>([11, 12, 15, 16, 17, 20, 21])

// Returns the row number (1–8) that a square is on.
function rowOf(square: SquareNumber): number {
  return Math.ceil(square / 4)
}

// Evaluates the board from Red's perspective.
// Positive = good for Red, negative = good for Black.
export function evaluate(board: Board, color: Color): number {
  let score = 0

  for (let sq = 1; sq <= 32; sq++) {
    const piece = board[sq]
    if (!piece) continue

    const sign = piece.color === 'red' ? 1 : -1

    // Material
    score += sign * 1

    // King bonus
    if (piece.isKing) score += sign * 5

    // Advancement: Red advances toward row 1; Black toward row 8.
    // Reward pieces closer to promotion.
    const row = rowOf(sq)
    const advancement =
      piece.color === 'red'
        ? (8 - row) * 0.1   // Red: lower row number = more advanced
        : (row - 1) * 0.1   // Black: higher row number = more advanced
    score += sign * advancement

    // Center control
    if (CENTER_SQUARES.has(sq)) score += sign * 0.15
  }

  // Mobility (from the perspective of the color being evaluated)
  const redMobility = getLegalMoves(board, 'red').length
  const blackMobility = getLegalMoves(board, 'black').length
  score += (redMobility - blackMobility) * 0.05

  // Return from the perspective of the given color
  return color === 'red' ? score : -score
}

