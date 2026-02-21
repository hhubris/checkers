<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import { useSettingsStore } from '../../stores/settingsStore'

const game = useGameStore()
const settings = useSettingsStore()

const visible = computed(() => {
  const gs = game.gameState
  if (!gs || gs.status !== 'playing' || game.uiState.isAIThinking) return false
  const player =
    gs.currentTurn === 'red' ? settings.redPlayer : settings.blackPlayer
  return player === 'human'
})
</script>

<template>
  <button v-if="visible" class="hint-btn" @click="game.requestHint()">
    Hint
  </button>
</template>

<style scoped>
.hint-btn {
  padding: 0.4rem 1rem;
  min-height: 44px;
  background: transparent;
  border: 1px solid var(--hint);
  border-radius: 4px;
  color: var(--hint);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
  transition:
    background 0.15s,
    color 0.15s;
  filter: brightness(1.4);
}

.hint-btn:hover {
  background: var(--hint);
  color: #000;
}
</style>
