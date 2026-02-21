<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import SquareComponent from './SquareComponent.vue'
import type { SquareNumber } from '../../types'

const game = useGameStore()

// Returns the checkers square number (1–32) for a given grid cell,
// or null if the cell is a light (non-playable) square.
function squareAt(row: number, col: number): SquareNumber | null {
  if ((row + col) % 2 === 0) return null
  const darkIndex = row % 2 === 0 ? (col - 1) / 2 : col / 2
  return row * 4 + darkIndex + 1
}

// Flat list of 64 cells in row-major order for v-for rendering.
const cells = computed(() => {
  const result: {
    key: string
    square: SquareNumber | null
    row: number
    col: number
  }[] = []
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      result.push({ key: `${row}-${col}`, square: squareAt(row, col), row, col })
    }
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

function handleSelect(square: SquareNumber) {
  game.selectSquare(square)
}
</script>

<template>
  <div class="board" role="grid" aria-label="Checkers board">
    <SquareComponent
      v-for="cell in cells"
      :key="cell.key"
      :square="cell.square"
      :piece="cell.square !== null ? (game.gameState?.board[cell.square] ?? null) : null"
      :isSelected="cell.square !== null && cell.square === selectedSquare"
      :isTarget="cell.square !== null && targetSquares.has(cell.square)"
      :isHinted="cell.square !== null && hintedSquares.has(cell.square)"
      :isLastMove="cell.square !== null && lastMoveSquares.has(cell.square)"
      @select="handleSelect"
    />
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
</style>
