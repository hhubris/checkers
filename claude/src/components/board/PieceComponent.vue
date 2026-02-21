<script setup lang="ts">
import type { Piece } from '../../types'

defineProps<{ piece: Piece }>()
</script>

<template>
  <div
    class="piece"
    :class="[piece.color, { king: piece.isKing }]"
    :aria-label="`${piece.color}${piece.isKing ? ' king' : ''}`"
  >
    <span v-if="piece.isKing" class="crown" aria-hidden="true">♛</span>
  </div>
</template>

<style scoped>
.piece {
  width: 78%;
  height: 78%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 3px 6px rgba(0, 0, 0, 0.4),
    inset 0 2px 4px var(--piece-highlight);
  transition: transform 0.15s ease;
  pointer-events: none;
  position: relative;
}

.piece.red {
  background: radial-gradient(circle at 35% 35%, #ff5533, var(--piece-red));
}

.piece.black {
  background: radial-gradient(circle at 35% 35%, #555, var(--piece-black));
}

.crown {
  font-size: 0.9em;
  color: var(--piece-crown);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
  line-height: 1;
}
</style>
