<script setup lang="ts">
import { computed, ref, watch, nextTick, onUnmounted } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import { squareAt, squareGridPos } from '../../engine/board'
import { playMove, playCapture, playKing } from '../../sound'
import SquareComponent from './SquareComponent.vue'
import PieceComponent from './PieceComponent.vue'
import type { Piece, SquareNumber } from '../../types'

const game = useGameStore()

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

// ── Highlight state ──────────────────────────────────────────

const selectedSquare = computed(() => game.uiState.selectedSquare)

// Final destinations — clicking these applies the move.
const targetSquares = computed(
  () => new Set(game.uiState.validMovesForSelected.map((m) => m.to)),
)

// All path squares (excluding the piece's own square) mapped to their
// 1-based step number. Only populated when any move is a multi-jump.
const pathStepNumbers = computed((): Map<SquareNumber, number> => {
  const moves = game.uiState.validMovesForSelected
  if (!moves.some((m) => m.path.length > 2)) return new Map()
  const map = new Map<SquareNumber, number>()
  for (const move of moves) {
    for (let i = 1; i < move.path.length; i++) {
      const sq = move.path[i]!
      const existing = map.get(sq)
      if (existing === undefined || i < existing) map.set(sq, i)
    }
  }
  return map
})

// Intermediate landing squares: in pathStepNumbers but not the final dest.
const intermediateSquares = computed(() => {
  const result = new Set<SquareNumber>()
  for (const [sq] of pathStepNumbers.value) {
    if (!targetSquares.value.has(sq)) result.add(sq)
  }
  return result
})

const hintedSquares = computed(() => {
  const h = game.uiState.hintedMoves[0]
  return h ? new Set<SquareNumber>([h.from, h.to]) : new Set<SquareNumber>()
})

const lastMoveSquares = computed(() => {
  const m = game.uiState.lastMove
  return m ? new Set<SquareNumber>([m.from, m.to]) : new Set<SquareNumber>()
})

// ── Animation state ──────────────────────────────────────────

const animating = ref(false)
const flyingPiece = ref<Piece | null>(null)
const flyingX = ref(0)
const flyingY = ref(0)
const flyingTransition = ref(false)
const hiddenSquares = ref(new Set<SquareNumber>())
const promotedSquare = ref<SquareNumber | null>(null)
// animToken is intentionally non-reactive — making it a ref would trigger
// unnecessary renders; it is only used to cancel stale animation callbacks.
let animToken = 0
let promotionTimer: ReturnType<typeof setTimeout> | null = null

onUnmounted(() => {
  if (promotionTimer !== null) clearTimeout(promotionTimer)
})

function doubleRaf(): Promise<void> {
  return new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  )
}

// ── Roving tabindex ──────────────────────────────────────────

const focusedSquare = ref<SquareNumber>(1)

function focusDomSquare(n: SquareNumber) {
  document.querySelector<HTMLElement>(`[data-square="${n}"]`)?.focus()
}

// ── Combined lastMove watcher: animation + focus ─────────────

watch(
  () => game.uiState.lastMove,
  async (move) => {
    if (!move) return
    const gs = game.gameState
    if (!gs) return
    const piece = gs.board[move.to]
    if (!piece) return

    // Play sound immediately as the move begins.
    if (move.captures.length > 0) playCapture()
    else playMove()

    // Update keyboard focus index immediately (tabindex updates next render).
    focusedSquare.value = move.to

    const token = ++animToken
    animating.value = true
    hiddenSquares.value = new Set([move.to])
    promotedSquare.value = null

    for (let i = 0; i < move.path.length - 1; i++) {
      const from = move.path[i]!
      const to = move.path[i + 1]!
      const fromPos = squareGridPos(from)
      const toPos = squareGridPos(to)

      // During flight show the pre-promotion state (no crown yet).
      flyingPiece.value = move.promotesToKing
        ? { ...piece, isKing: false }
        : piece
      flyingX.value = fromPos.x
      flyingY.value = fromPos.y
      flyingTransition.value = false

      await doubleRaf()
      if (token !== animToken) return

      flyingTransition.value = true
      flyingX.value = toPos.x
      flyingY.value = toPos.y

      await new Promise((r) => setTimeout(r, 265))
      if (token !== animToken) return
    }

    // Land: reveal real piece, trigger crown animation if kinged.
    flyingPiece.value = null
    flyingTransition.value = false
    hiddenSquares.value = new Set()
    animating.value = false

    if (move.promotesToKing) {
      playKing()
      promotedSquare.value = move.to
      promotionTimer = setTimeout(() => {
        if (token === animToken) promotedSquare.value = null
        promotionTimer = null
      }, 700)
    }

    // Move DOM focus after animation completes.
    await nextTick()
    focusDomSquare(move.to)
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

async function moveFocus(n: SquareNumber) {
  focusedSquare.value = n
  await nextTick()
  focusDomSquare(n)
}

function handleSelect(square: SquareNumber) {
  if (animating.value) return
  // Intermediate squares are informational — clicking them should not
  // deselect the piece or attempt an invalid move.
  if (intermediateSquares.value.has(square)) return
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
    const step = pathStepNumbers.value.get(square)
    parts.push(step ? `move destination, step ${step}` : 'move destination')
  } else if (intermediateSquares.value.has(square)) {
    parts.push(`jump step ${pathStepNumbers.value.get(square)}`)
  } else if (game.mustJumpSquares.has(square)) {
    parts.push('must jump')
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
        :piece="
          cell.square !== null
            ? hiddenSquares.has(cell.square)
              ? null
              : (game.gameState?.board[cell.square] ?? null)
            : null
        "
        :isSelected="cell.square !== null && cell.square === selectedSquare"
        :isTarget="cell.square !== null && targetSquares.has(cell.square)"
        :isIntermediate="cell.square !== null && intermediateSquares.has(cell.square)"
        :stepNumber="cell.square !== null ? pathStepNumbers.get(cell.square) : undefined"
        :isHinted="cell.square !== null && hintedSquares.has(cell.square)"
        :isLastMove="cell.square !== null && lastMoveSquares.has(cell.square)"
        :isMustJump="cell.square !== null && game.mustJumpSquares.has(cell.square)"
        :squareTabindex="
          cell.square !== null ? (cell.square === focusedSquare ? 0 : -1) : undefined
        "
        :ariaLabel="cell.square !== null ? squareLabel(cell.square) : undefined"
        :ariaSelected="cell.square !== null && cell.square === selectedSquare"
        :promoted="cell.square !== null && cell.square === promotedSquare"
        @select="handleSelect"
        @focused="handleFocused"
      />
    </div>

    <!-- Absolutely-positioned overlay for movement animation -->
    <div
      v-if="flyingPiece"
      class="flying-piece"
      :class="{ 'fly-go': flyingTransition }"
      :style="{ left: flyingX + '%', top: flyingY + '%' }"
      aria-hidden="true"
    >
      <PieceComponent :piece="flyingPiece" />
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
  position: relative;
}

/* display:contents keeps 8×8 grid intact while
   preserving role="row" in the accessibility tree. */
.board-row {
  display: contents;
}

/* Flying piece overlay */
.flying-piece {
  position: absolute;
  width: 12.5%;
  height: 12.5%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 10;
}

.flying-piece.fly-go {
  transition:
    left 0.25s ease-out,
    top 0.25s ease-out;
}
</style>
