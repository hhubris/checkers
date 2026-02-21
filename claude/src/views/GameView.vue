<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import { useSettingsStore } from '../stores/settingsStore'
import { playWin, playDraw } from '../sound'
import BoardComponent from '../components/board/BoardComponent.vue'
import GameStatusBar from '../components/panels/GameStatusBar.vue'
import MoveHistoryPanel from '../components/panels/MoveHistoryPanel.vue'
import HintButton from '../components/panels/HintButton.vue'
import GameOverModal from '../components/panels/GameOverModal.vue'
import type { HistoryEntry } from '../types'

const game = useGameStore()
const settings = useSettingsStore()
const router = useRouter()

onMounted(() => {
  document.documentElement.setAttribute('data-theme', settings.theme)
  // If no game is in progress (navigated directly), go home.
  if (!game.gameState) {
    router.replace('/')
    return
  }
})

// ── ARIA live region ─────────────────────────────────────────

const announcement = ref('')

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function buildAnnouncement(entry: HistoryEntry): string {
  const { color, move } = entry
  const cap = move.captures.length
  const parts: string[] = []

  if (cap === 0) {
    parts.push(`${capitalize(color)} moves from ${move.from} to ${move.to}.`)
  } else {
    const last = move.path[move.path.length - 1]
    parts.push(
      `${capitalize(color)} jumps from ${move.path[0]} to ${last}, ` +
        `${cap} piece${cap > 1 ? 's' : ''} captured.`,
    )
  }

  if (move.promotesToKing) {
    parts.push(`${capitalize(color)} is kinged on square ${move.to}.`)
  }

  return parts.join(' ')
}

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
  padding-top: 3.25rem;
}

@media (max-width: 640px) {
  .game-view {
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
  }
}
</style>
