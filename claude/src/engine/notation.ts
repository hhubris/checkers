import type { HistoryEntry, Move } from '../types'

export function toNotation(move: Move): string {
  if (move.captures.length === 0) {
    return `${move.from}-${move.to}`
  }
  // path includes all squares occupied during the move: [from, ...landings]
  // e.g. [11, 18, 25] → "11x18x25"
  return move.path.join('x')
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function buildAnnouncement(entry: HistoryEntry): string {
  const { color, move } = entry
  const cap = move.captures.length
  const parts: string[] = []

  if (cap === 0) {
    parts.push(`${capitalize(color)} moves from ${move.from} to ${move.to}.`)
  } else {
    const last = move.path[move.path.length - 1]
    parts.push(
      `${capitalize(color)} jumps from ${move.path[0]} to ${last}, ` +
        `${cap} piece${cap > 1 ? 's' : ''} captured.`,
    )
  }

  if (move.promotesToKing) {
    parts.push(`${capitalize(color)} is kinged on square ${move.to}.`)
  }

  return parts.join(' ')
}
