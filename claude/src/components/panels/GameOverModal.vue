<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../../stores/gameStore'

const game = useGameStore()
const router = useRouter()

const visible = computed(
  () => game.gameState && game.gameState.status !== 'playing',
)

const winnerText = computed(() => {
  if (game.gameState?.status === 'red-wins') return 'Red wins!'
  if (game.gameState?.status === 'black-wins') return 'Black wins!'
  return ''
})

function playAgain() {
  game.startGame()
}

function mainMenu() {
  game.resetGame()
  router.push('/')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal">
        <h2 id="modal-title" class="winner-text">{{ winnerText }}</h2>
        <p class="sub">Game over</p>
        <div class="actions">
          <button class="btn primary" @click="playAgain">Play Again</button>
          <button class="btn secondary" @click="mainMenu">Main Menu</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes overlayIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.88) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: overlayIn 0.2s ease both;
}

.modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 2rem 2.5rem;
  text-align: center;
  min-width: 240px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
  animation: modalIn 0.3s cubic-bezier(0.34, 1.2, 0.64, 1) both;
}

.winner-text {
  margin: 0 0 0.25rem;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
}

.sub {
  margin: 0 0 1.5rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.btn {
  padding: 0.5rem 1.25rem;
  border-radius: 5px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border);
  transition: opacity 0.15s;
}

.btn:hover {
  opacity: 0.85;
}

.btn.primary {
  background: var(--accent);
  color: var(--accent-text);
  border-color: var(--accent);
}

.btn.secondary {
  background: transparent;
  color: var(--text);
}
</style>
