<script setup lang="ts">
import { onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useSettingsStore } from '../stores/settingsStore'
import BoardComponent from '../components/board/BoardComponent.vue'
import GameStatusBar from '../components/panels/GameStatusBar.vue'
import MoveHistoryPanel from '../components/panels/MoveHistoryPanel.vue'
import HintButton from '../components/panels/HintButton.vue'
import GameOverModal from '../components/panels/GameOverModal.vue'

const game = useGameStore()
const settings = useSettingsStore()

onMounted(() => {
  document.documentElement.setAttribute('data-theme', settings.theme)
  game.startGame()
})
</script>

<template>
  <main class="game-view">
    <div class="board-area">
      <GameStatusBar />
      <BoardComponent />
      <div class="board-footer">
        <HintButton />
      </div>
    </div>
    <aside class="side-panel">
      <MoveHistoryPanel />
    </aside>
    <GameOverModal />
  </main>
</template>

<style scoped>
.game-view {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 1.25rem;
  padding: 1rem;
}

.board-area {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: min(80vh, 100%);
  flex-shrink: 0;
}

.board-footer {
  display: flex;
  justify-content: flex-end;
  min-height: 2rem;
}

.side-panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 200px;
  flex-shrink: 0;
  padding-top: 3.25rem; /* align with board top (below status bar) */
}

@media (max-width: 640px) {
  .game-view {
    flex-direction: column;
    align-items: center;
  }

  .side-panel {
    width: 100%;
    max-width: min(80vh, 100%);
    padding-top: 0;
  }
}
</style>
