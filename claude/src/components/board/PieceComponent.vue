<script setup lang="ts">
import type { Piece } from '../../types'

defineProps<{ piece: Piece; promoted?: boolean }>()
</script>

<template>
  <div
    class="piece"
    :class="[piece.color, { king: piece.isKing, promoted }]"
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

/* Crown bounces in only when the piece has just been promoted. */
@keyframes crownBounce {
  0% {
    opacity: 0;
    transform: scale(0.3) rotate(-20deg);
  }
  60% {
    opacity: 1;
    transform: scale(1.35) rotate(8deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.piece.promoted .crown {
  animation: crownBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
</style>
