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
/* ── Base disc ───────────────────────────────────────────────── */
.piece {
  width: 80%;
  height: 80%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  pointer-events: none;
  transition: transform 0.12s ease;
}

/* ── Dome highlight — a bright elliptical sheen upper-left ───── */
.piece::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(
    ellipse 52% 44% at 36% 26%,
    rgba(255, 255, 255, 0.72) 0%,
    rgba(255, 255, 255, 0.22) 38%,
    transparent 66%
  );
  z-index: 2;
  pointer-events: none;
}

/* ── Concentric inner ring — gives the piece a "checker" groove ─ */
.piece::after {
  content: '';
  position: absolute;
  inset: 18%;
  border-radius: 50%;
  border: 1.5px solid rgba(0, 0, 0, 0.18);
  z-index: 1;
  pointer-events: none;
}

/* ── Red piece ───────────────────────────────────────────────── */
.piece.red {
  background: radial-gradient(
    circle at 37% 31%,
    var(--piece-red-hi) 0%,
    var(--piece-red) 42%,
    var(--piece-red-lo) 78%,
    var(--piece-red-rim) 100%
  );
  box-shadow:
    /* concave rim — bottom darkens to show curvature */
    inset 0 -5px 10px rgba(0, 0, 0, 0.45),
    /* top-edge rim glint */
    inset 0 2px 3px rgba(255, 200, 170, 0.22),
    /* disc thickness — darker "side" below the piece */
    0 4px 0 var(--piece-red-rim),
    /* drop shadow on the board */
    0 5px 14px rgba(0, 0, 0, 0.55);
}

/* ── Black piece ─────────────────────────────────────────────── */
.piece.black {
  background: radial-gradient(
    circle at 37% 31%,
    var(--piece-black-hi) 0%,
    var(--piece-black) 42%,
    var(--piece-black-lo) 78%,
    var(--piece-black-rim) 100%
  );
  box-shadow:
    inset 0 -5px 10px rgba(0, 0, 0, 0.6),
    inset 0 2px 3px rgba(255, 255, 255, 0.07),
    0 4px 0 var(--piece-black-rim),
    0 5px 14px rgba(0, 0, 0, 0.6);
}

/* ── King — gold ring inside the concentric groove ───────────── */
.piece.king::after {
  border-color: rgba(255, 210, 0, 0.55);
  border-width: 2px;
  inset: 16%;
}

/* ── Crown label ─────────────────────────────────────────────── */
.crown {
  font-size: 0.85em;
  color: var(--piece-crown);
  text-shadow:
    0 1px 3px rgba(0, 0, 0, 0.7),
    0 0 6px rgba(255, 200, 0, 0.4);
  line-height: 1;
  position: relative;
  z-index: 3;
}

/* ── Kinging animation ───────────────────────────────────────── */
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
