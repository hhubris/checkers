import type { Board, Color, GameState, Move, SquareNumber } from '../types'
import { getMoveDiagonals, isOddRow, isPromotionSquare, isValidStep } from './board'

// Computes the landing square when jumping FROM `from` OVER `over`.
// The diff between `from` and `over` encodes direction; the second
// diagonal step uses the parity of `over` (which differs from `from`).
// Landing offsets from `from`:  ±7 or ±9 in all cases.
function landingSquare(
  from: SquareNumber,
  over: SquareNumber,
): SquareNumber {
  const odd = isOddRow(from)
  const diff = over - from
  if (odd) {
    if (diff === -4) return from - 9  // upper-left
    if (diff === -3) return from - 7  // upper-right
    if (diff === 4) return from + 7   // lower-left
    if (diff === 5) return from + 9   // lower-right
  } else {
    if (diff === -5) return from - 9  // upper-left
    if (diff === -4) return from - 7  // upper-right
    if (diff === 3) return from + 7   // lower-left
    if (diff === 4) return from + 9   // lower-right
  }
  throw new Error(`Unexpected step: ${from} → ${over}`)
}

// Recursively expands all jump sequences starting from `square`.
// Returns complete Move objects with the original `origin` as `from`.
function expandJumps(
  board: Board,
  origin: SquareNumber,
  square: SquareNumber,
  color: Color,
  isKing: boolean,
  captures: SquareNumber[],
  visited: Set<SquareNumber>,
): Move[] {
  const results: Move[] = []

  for (const neighbor of getMoveDiagonals(square, color, isKing)) {
    const occupant = board[neighbor]
    if (!occupant || occupant.color === color) continue
    if (visited.has(neighbor)) continue

    const landing = landingSquare(square, neighbor)
    if (!isValidStep(neighbor, landing)) continue
    if (board[landing] !== null) continue
    if (visited.has(landing)) continue

    const newCaptures = [...captures, neighbor]
    const promotes = isPromotionSquare(landing, color)
    const newIsKing = isKing || promotes

    const nextVisited = new Set(visited)
    nextVisited.add(neighbor)
    nextVisited.add(square)

    const continuations = expandJumps(
      board,
      origin,
      landing,
      color,
      newIsKing,
      newCaptures,
      nextVisited,
    )

    if (continuations.length === 0) {
      results.push({
        from: origin,
        to: landing,
        captures: newCaptures,
        promotesToKing: promotes,
      })
    } else {
      results.push(...continuations)
    }
  }

  return results
}

export function getJumpsFrom(board: Board, square: SquareNumber): Move[] {
  const piece = board[square]
  if (!piece) return []
  return expandJumps(
    board,
    square,
    square,
    piece.color,
    piece.isKing,
    [],
    new Set([square]),
  )
}

export function getSimpleMoves(board: Board, square: SquareNumber): Move[] {
  const piece = board[square]
  if (!piece) return []
  return getMoveDiagonals(square, piece.color, piece.isKing)
    .filter((dest) => board[dest] === null)
    .map((dest) => ({
      from: square,
      to: dest,
      captures: [],
      promotesToKing: isPromotionSquare(dest, piece.color),
    }))
}

// Returns all legal moves for the current player.
// If any jump exists for any piece of that color, only jumps are returned.
export function getLegalMoves(state: GameState): Move[] {
  const { board, currentTurn } = state
  const jumps: Move[] = []
  const simples: Move[] = []

  for (let sq = 1; sq <= 32; sq++) {
    const piece = board[sq]
    if (!piece || piece.color !== currentTurn) continue
    jumps.push(...getJumpsFrom(board, sq))
    simples.push(...getSimpleMoves(board, sq))
  }

  return jumps.length > 0 ? jumps : simples
}

export function isValidMove(state: GameState, move: Move): boolean {
  const legal = getLegalMoves(state)
  return legal.some(
    (m) =>
      m.from === move.from &&
      m.to === move.to &&
      m.captures.length === move.captures.length,
  )
}
