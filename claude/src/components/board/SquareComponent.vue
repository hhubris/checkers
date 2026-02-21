<script setup lang="ts">
import type { Piece } from '../../types'
import PieceComponent from './PieceComponent.vue'

const props = defineProps<{
  square: number | null
  piece: Piece | null
  isSelected: boolean
  isTarget: boolean
  isIntermediate?: boolean
  stepNumber?: number
  isHinted: boolean
  isLastMove: boolean
  squareTabindex?: number
  ariaLabel?: string
  ariaSelected?: boolean
  promoted?: boolean
}>()

const emit = defineEmits<{
  select: [square: number]
  focused: [square: number]
}>()

function onClick() {
  if (props.square !== null) emit('select', props.square)
}

function onFocus() {
  if (props.square !== null) emit('focused', props.square)
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
      intermediate: isIntermediate,
      hinted: isHinted,
      'last-move': isLastMove,
    }"
    :role="square !== null ? 'gridcell' : 'presentation'"
    :aria-label="ariaLabel"
    :aria-selected="ariaSelected || undefined"
    :tabindex="squareTabindex"
    :data-square="square !== null ? square : undefined"
    @click="onClick"
    @focus="onFocus"
    @keydown.enter.prevent="onClick"
    @keydown.space.prevent="onClick"
  >
    <span v-if="square !== null" class="sq-num" aria-hidden="true">
      {{ square }}
    </span>

    <div v-if="square !== null" class="piece-wrapper">
      <PieceComponent v-if="piece" :piece="piece" :promoted="promoted" />
      <template v-else-if="isTarget || isIntermediate || isHinted">
        <!-- Numbered step badge for multi-jump paths -->
        <div v-if="stepNumber !== undefined" class="step-badge" aria-hidden="true">
          {{ stepNumber }}
        </div>
        <!-- Plain dot for single-step targets and hints -->
        <div v-else class="move-dot" />
      </template>
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

.selected::after,
.target::after,
.intermediate::after,
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
  opacity: 0.85;
}

/* Intermediate squares are on the path but not the final landing —
   shown dimmer so the player knows to click the final destination. */
.intermediate::after {
  background: var(--highlight);
  opacity: 0.35;
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

.step-badge {
  width: 44%;
  height: 44%;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 0.7em;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
</style>
