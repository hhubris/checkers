<script setup lang="ts">
import { onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useSettingsStore } from '../stores/settingsStore'
import BoardComponent from '../components/board/BoardComponent.vue'
import GameStatusBar from '../components/panels/GameStatusBar.vue'

const game = useGameStore()
const settings = useSettingsStore()

onMounted(() => {
  // Apply saved theme immediately, then start game
  document.documentElement.setAttribute('data-theme', settings.theme)
  game.startGame()
})
</script>

<template>
  <main class="game-view">
    <div class="board-area">
      <GameStatusBar />
      <BoardComponent />
    </div>
  </main>
</template>

<style scoped>
.game-view {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.board-area {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: min(80vh, 100%);
}
</style>
