<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import { playWin, playDraw } from '../sound'
import { buildAnnouncement } from '../engine/notation'
import BoardComponent from '../components/board/BoardComponent.vue'
import GameStatusBar from '../components/panels/GameStatusBar.vue'
import MoveHistoryPanel from '../components/panels/MoveHistoryPanel.vue'
import HintButton from '../components/panels/HintButton.vue'
import GameOverModal from '../components/panels/GameOverModal.vue'

const game = useGameStore()
const router = useRouter()

onMounted(() => {
  // If no game is in progress (navigated directly), go home.
  if (!game.gameState) {
    router.replace('/')
    return
  }
})

// ── ARIA live region ─────────────────────────────────────────

const announcement = ref('')

watch(
  [
    () => game.gameState?.moveHistory.length ?? 0,
    () => game.gameState?.status,
  ] as const,
  ([len, status], [prevLen]) => {
    const gs = game.gameState
    if (!gs) return

    if (status === 'red-wins') {
      playWin()
      announcement.value = 'Red wins! Game over.'
      return
    }
    if (status === 'black-wins') {
      playWin()
      announcement.value = 'Black wins! Game over.'
      return
    }
    if (status === 'draw') {
      playDraw()
      announcement.value = "It's a draw! Game over."
      return
    }

    if (len > (prevLen ?? 0) && gs.moveHistory.length) {
      const entry = gs.moveHistory[len - 1]
      if (entry) announcement.value = buildAnnouncement(entry)
    }
  },
)
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
    <!-- Screen reader announcements -->
    <div aria-live="polite" aria-atomic="true" class="sr-only">
      {{ announcement }}
    </div>
  </main>
</template>

<style scoped>
.game-view {
  flex: 1;
  display: grid;
  grid-template-columns: min(80vh, 1fr) 200px;
  column-gap: 1.25rem;
  align-items: start;
  justify-content: center;
  padding: 1rem;
}

.board-area {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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
  padding-top: 3.25rem;
  align-self: stretch;
}

@media (max-width: 640px) {
  .game-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .board-area {
    gap: 0.5rem;
    width: 100%;
  }

  .board-footer {
    min-height: 1.5rem;
  }

  .side-panel {
    width: 100%;
    padding-top: 0;
    align-self: auto;
  }
}
</style>
