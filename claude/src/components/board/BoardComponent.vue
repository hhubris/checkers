<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import SquareComponent from './SquareComponent.vue'
import type { SquareNumber } from '../../types'

const game = useGameStore()

// Returns the checkers square number (1–32) for a grid cell,
// or null for a light (non-playable) square.
function squareAt(row: number, col: number): SquareNumber | null {
  if ((row + col) % 2 === 0) return null
  const darkIndex = row % 2 === 0 ? (col - 1) / 2 : col / 2
  return row * 4 + darkIndex + 1
}

// Nested rows for role="row" wrapping.
const rows = computed(() => {
  const result: { key: string; square: SquareNumber | null }[][] = []
  for (let row = 0; row < 8; row++) {
    const cells = []
    for (let col = 0; col < 8; col++) {
      cells.push({ key: `${row}-${col}`, square: squareAt(row, col) })
    }
    result.push(cells)
  }
  return result
})

const selectedSquare = computed(() => game.uiState.selectedSquare)

const targetSquares = computed(
  () => new Set(game.uiState.validMovesForSelected.map((m) => m.to)),
)

const hintedSquares = computed(() => {
  const h = game.uiState.hintedMoves[0]
  return h ? new Set<SquareNumber>([h.from, h.to]) : new Set<SquareNumber>()
})

const lastMoveSquares = computed(() => {
  const m = game.uiState.lastMove
  return m ? new Set<SquareNumber>([m.from, m.to]) : new Set<SquareNumber>()
})

// ── Roving tabindex ──────────────────────────────────────────

const focusedSquare = ref<SquareNumber>(1)

function focusDomSquare(n: SquareNumber) {
  const el = document.querySelector<HTMLElement>(`[data-square="${n}"]`)
  el?.focus()
}

async function moveFocus(n: SquareNumber) {
  focusedSquare.value = n
  await nextTick()
  focusDomSquare(n)
}

// After a move, follow the piece to its destination.
watch(
  () => game.uiState.lastMove,
  (move) => {
    if (move) moveFocus(move.to)
  },
)

// ── Keyboard navigation ──────────────────────────────────────

function handleKeyDown(e: KeyboardEvent) {
  const n = focusedSquare.value
  switch (e.key) {
    case 'ArrowRight':
      e.preventDefault()
      moveFocus(n === 32 ? 1 : n + 1)
      break
    case 'ArrowLeft':
      e.preventDefault()
      moveFocus(n === 1 ? 32 : n - 1)
      break
    case 'ArrowDown':
      e.preventDefault()
      moveFocus(n > 28 ? n - 28 : n + 4)
      break
    case 'ArrowUp':
      e.preventDefault()
      moveFocus(n < 5 ? n + 28 : n - 4)
      break
    case 'Escape':
      e.preventDefault()
      game.deselect()
      break
  }
}

function handleSelect(square: SquareNumber) {
  game.selectSquare(square)
}

function handleFocused(square: SquareNumber) {
  focusedSquare.value = square
}

// ── ARIA labels ──────────────────────────────────────────────

function squareLabel(square: SquareNumber): string {
  const gs = game.gameState
  const piece = gs?.board[square] ?? null
  const parts = [`Square ${square}`]

  if (piece) {
    parts.push(`${piece.color} ${piece.isKing ? 'king' : 'piece'}`)
  }

  if (selectedSquare.value === square) {
    parts.push('selected')
  } else if (targetSquares.value.has(square)) {
    parts.push('move destination')
  } else if (hintedSquares.value.has(square)) {
    parts.push('hint')
  }

  return parts.join(', ')
}
</script>

<template>
  <div
    class="board"
    role="grid"
    aria-label="Checkers board"
    @keydown="handleKeyDown"
  >
    <div
      v-for="(rowCells, rowIdx) in rows"
      :key="rowIdx"
      role="row"
      class="board-row"
    >
      <SquareComponent
        v-for="cell in rowCells"
        :key="cell.key"
        :square="cell.square"
        :piece="cell.square !== null ? (game.gameState?.board[cell.square] ?? null) : null"
        :isSelected="cell.square !== null && cell.square === selectedSquare"
        :isTarget="cell.square !== null && targetSquares.has(cell.square)"
        :isHinted="cell.square !== null && hintedSquares.has(cell.square)"
        :isLastMove="cell.square !== null && lastMoveSquares.has(cell.square)"
        :squareTabindex="cell.square !== null ? (cell.square === focusedSquare ? 0 : -1) : undefined"
        :ariaLabel="cell.square !== null ? squareLabel(cell.square) : undefined"
        :ariaSelected="cell.square !== null && cell.square === selectedSquare"
        @select="handleSelect"
        @focused="handleFocused"
      />
    </div>
  </div>
</template>

<style scoped>
.board {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  width: 100%;
  aspect-ratio: 1;
  border: 3px solid var(--border);
  border-radius: 2px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

/* display:contents keeps the 8×8 grid layout intact
   while preserving role="row" in the accessibility tree. */
.board-row {
  display: contents;
}
</style>
