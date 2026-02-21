<script setup lang="ts">
import type { Piece } from '../../types'
import PieceComponent from './PieceComponent.vue'

const props = defineProps<{
  square: number | null
  piece: Piece | null
  isSelected: boolean
  isTarget: boolean
  isHinted: boolean
  isLastMove: boolean
}>()

const emit = defineEmits<{ select: [square: number] }>()

function onClick() {
  if (props.square !== null) emit('select', props.square)
}
</script>

<template>
  <div
    class="square"
    :class="{
      dark: square !== null,
      light: square === null,
      selected: isSelected,
      target: isTarget,
      hinted: isHinted,
      'last-move': isLastMove,
    }"
    :role="square !== null ? 'gridcell' : undefined"
    :aria-label="square !== null ? `Square ${square}` : undefined"
    :tabindex="square !== null ? 0 : undefined"
    @click="onClick"
    @keydown.enter.prevent="onClick"
    @keydown.space.prevent="onClick"
  >
    <!-- Square number label (debug / orientation aid) -->
    <span v-if="square !== null" class="sq-num" aria-hidden="true">
      {{ square }}
    </span>

    <div v-if="square !== null" class="piece-wrapper">
      <PieceComponent v-if="piece" :piece="piece" />
      <!-- Valid-move dot when no piece occupies a target square -->
      <div v-else-if="isTarget || isHinted" class="move-dot" />
    </div>
  </div>
</template>

<style scoped>
.square {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  user-select: none;
}

.light {
  background-color: var(--board-light);
}

.dark {
  background-color: var(--board-dark);
  cursor: pointer;
}

.dark:focus-visible {
  outline: 3px solid #fff;
  outline-offset: -3px;
  z-index: 1;
}

/* Highlight overlays */
.selected::after,
.target::after,
.hinted::after,
.last-move::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.selected::after {
  background: var(--highlight);
}

.target::after {
  background: var(--highlight);
  opacity: 0.7;
}

.hinted::after {
  background: var(--hint);
}

.last-move::after {
  background: var(--last-move);
}

.sq-num {
  position: absolute;
  top: 3px;
  left: 4px;
  font-size: 0.55em;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1;
  pointer-events: none;
  z-index: 1;
}

.piece-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.move-dot {
  width: 28%;
  height: 28%;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.25);
}
</style>
