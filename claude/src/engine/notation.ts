import type { Move } from '../types'

export function toNotation(move: Move): string {
  if (move.captures.length === 0) {
    return `${move.from}-${move.to}`
  }
  // path includes all squares occupied during the move: [from, ...landings]
  // e.g. [11, 18, 25] → "11x18x25"
  return move.path.join('x')
}
