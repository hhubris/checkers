<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useGameStore } from '../../stores/gameStore'

const game = useGameStore()
const listEl = ref<HTMLElement | null>(null)

watch(
  () => game.gameState?.moveHistory.length,
  async () => {
    await nextTick()
    if (listEl.value) {
      listEl.value.scrollTop = listEl.value.scrollHeight
    }
  },
)
</script>

<template>
  <div class="history-panel">
    <h2 class="panel-title">Move History</h2>
    <ol v-if="game.gameState?.moveHistory.length" ref="listEl" class="history-list">
      <li
        v-for="(entry, i) in game.gameState.moveHistory"
        :key="i"
        :class="['entry', { latest: i === game.gameState.moveHistory.length - 1 }]"
      >
        <span class="move-num">{{ entry.moveNumber }}.</span>
        <span :class="['color-dot', entry.color]" />
        <span class="notation">{{ entry.notation }}</span>
      </li>
    </ol>
    <p v-else class="empty">No moves yet.</p>
  </div>
</template>

<style scoped>
.history-panel {
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
}

.panel-title {
  margin: 0;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
}

.history-list {
  list-style: none;
  margin: 0;
  padding: 0.25rem 0;
  overflow-y: auto;
  max-height: 240px;
  scroll-behavior: smooth;
}

.entry {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 1rem;
  font-size: 0.875rem;
  color: var(--text-muted);
  transition: background 0.15s;
}

.entry.latest {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text);
  font-weight: 600;
}

.move-num {
  min-width: 1.8rem;
  text-align: right;
  color: var(--text-muted);
  font-size: 0.75rem;
}

.color-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.color-dot.red {
  background: var(--piece-red);
}

.color-dot.black {
  background: var(--piece-black);
  border: 1px solid var(--text-muted);
}

.empty {
  margin: 0;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: var(--text-muted);
}
</style>
