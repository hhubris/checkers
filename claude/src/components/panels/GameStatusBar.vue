<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../../stores/gameStore'

const game = useGameStore()

const statusText = computed(() => {
  const s = game.gameState
  if (!s) return ''
  if (s.status === 'red-wins') return 'Red wins!'
  if (s.status === 'black-wins') return 'Black wins!'
  if (game.uiState.isAIThinking) return 'AI is thinking…'
  return s.currentTurn === 'red' ? "Red's turn" : "Black's turn"
})
</script>

<template>
  <div v-if="game.gameState" class="status-bar">
    <span class="turn-label">{{ statusText }}</span>
    <div class="captures">
      <span class="cap-item">
        <span class="dot red-dot" />
        Captured: {{ game.gameState.capturedByRed }}
      </span>
      <span class="cap-item">
        <span class="dot black-dot" />
        Captured: {{ game.gameState.capturedByBlack }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.95rem;
  color: var(--text);
}

.turn-label {
  font-weight: 600;
}

.captures {
  display: flex;
  gap: 1.25rem;
}

.cap-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.red-dot {
  background: var(--piece-red);
}

.black-dot {
  background: var(--piece-black);
  border: 1px solid var(--text-muted);
}
</style>
