<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '../stores/settingsStore'
import { useGameStore } from '../stores/gameStore'
import type { Difficulty, PlayMode, ThemeId } from '../types'

const router = useRouter()
const settings = useSettingsStore()
const game = useGameStore()

// ── Local form state (seeded from persisted settings) ────────

const mode = ref<PlayMode>(
  settings.redPlayer === 'human' && settings.blackPlayer === 'human'
    ? 'hvh'
    : settings.redPlayer === 'ai' && settings.blackPlayer === 'ai'
      ? 'ava'
      : 'hva',
)
const humanSide = ref<HumanSide>(
  settings.redPlayer === 'human' ? 'red' : 'black',
)
const aiDifficulty = ref<Difficulty>(
  mode.value === 'hva'
    ? humanSide.value === 'red'
      ? settings.blackDifficulty
      : settings.redDifficulty
    : 'medium',
)
const redDifficulty = ref<Difficulty>(settings.redDifficulty)
const blackDifficulty = ref<Difficulty>(settings.blackDifficulty)
const theme = ref<ThemeId>(settings.theme)

const isHvA = computed(() => mode.value === 'hva')
const isAvA = computed(() => mode.value === 'ava')

// Typed option arrays — prevents TypeScript from widening val to string,
// which would require unsafe 'as ThemeId' casts in the template.
type HumanSide = 'red' | 'black'
const MODE_OPTIONS: [PlayMode, string][] = [
  ['hvh', 'Human vs Human'],
  ['hva', 'Human vs AI'],
  ['ava', 'AI vs AI'],
]
const SIDE_OPTIONS: [HumanSide, string][] = [
  ['red', 'Red (goes second)'],
  ['black', 'Black (goes first)'],
]
const DIFF_OPTIONS: [Difficulty, string][] = [
  ['easy', 'Easy'],
  ['medium', 'Medium'],
  ['hard', 'Hard'],
]
const THEME_OPTIONS: [ThemeId, string][] = [
  ['classic', 'Classic'],
  ['ocean', 'Ocean'],
]

function applyTheme(t: ThemeId) {
  theme.value = t
  document.documentElement.setAttribute('data-theme', t)
}

function startGame() {
  settings.setTheme(theme.value)

  if (mode.value === 'hvh') {
    settings.setPlayers({ redPlayer: 'human', blackPlayer: 'human' })
  } else if (mode.value === 'hva') {
    const isRedHuman = humanSide.value === 'red'
    settings.setPlayers({
      redPlayer: isRedHuman ? 'human' : 'ai',
      blackPlayer: isRedHuman ? 'ai' : 'human',
      redDifficulty: isRedHuman ? 'medium' : aiDifficulty.value,
      blackDifficulty: isRedHuman ? aiDifficulty.value : 'medium',
    })
  } else {
    settings.setPlayers({
      redPlayer: 'ai',
      blackPlayer: 'ai',
      redDifficulty: redDifficulty.value,
      blackDifficulty: blackDifficulty.value,
    })
  }

  game.startGame()
  router.push('/game')
}
</script>

<template>
  <main class="home">
    <div class="card">
      <header class="card-header">
        <div class="board-icon" aria-hidden="true">
          <div v-for="i in 4" :key="i" class="icon-row">
            <span
              v-for="j in 4"
              :key="j"
              :class="['icon-sq', (i + j) % 2 === 0 ? 'dark' : 'light']"
            />
          </div>
        </div>
        <h1 class="title">Checkers</h1>
      </header>

      <!-- ── Play mode ──────────────────────────────────── -->
      <section class="section">
        <label class="section-label">Play mode</label>
        <div class="toggle-group" role="radiogroup" aria-label="Play mode">
          <label
            v-for="[val, text] in MODE_OPTIONS"
            :key="val"
            :class="['toggle', { active: mode === val }]"
          >
            <input type="radio" name="mode" :value="val" v-model="mode" class="sr-only" />
            {{ text }}
          </label>
        </div>
      </section>

      <!-- ── Human side (hva only) ──────────────────────── -->
      <section v-if="isHvA" class="section">
        <label class="section-label">You play as</label>
        <div class="toggle-group" role="radiogroup" aria-label="Your side">
          <label
            v-for="[val, text] in SIDE_OPTIONS"
            :key="val"
            :class="['toggle', { active: humanSide === val }]"
          >
            <input type="radio" name="side" :value="val" v-model="humanSide" class="sr-only" />
            <span :class="['side-dot', val]" />
            {{ text }}
          </label>
        </div>
      </section>

      <!-- ── AI difficulty (hva) ────────────────────────── -->
      <section v-if="isHvA" class="section">
        <label class="section-label">AI difficulty</label>
        <div class="toggle-group" role="radiogroup" aria-label="AI difficulty">
          <label
            v-for="[val, text] in DIFF_OPTIONS"
            :key="val"
            :class="['toggle', { active: aiDifficulty === val }]"
          >
            <input
              type="radio"
              name="ai-diff"
              :value="val"
              v-model="aiDifficulty"
              class="sr-only"
            />
            {{ text }}
          </label>
        </div>
      </section>

      <!-- ── AI difficulty (ava) ────────────────────────── -->
      <template v-if="isAvA">
        <section class="section">
          <label class="section-label">
            <span class="side-dot red" /> Red difficulty
          </label>
          <div class="toggle-group" role="radiogroup" aria-label="Red difficulty">
            <label
              v-for="[val, text] in DIFF_OPTIONS"
              :key="val"
              :class="['toggle', { active: redDifficulty === val }]"
            >
              <input
                type="radio"
                name="red-diff"
                :value="val"
                v-model="redDifficulty"
                class="sr-only"
              />
              {{ text }}
            </label>
          </div>
        </section>
        <section class="section">
          <label class="section-label">
            <span class="side-dot black" /> Black difficulty
          </label>
          <div class="toggle-group" role="radiogroup" aria-label="Black difficulty">
            <label
              v-for="[val, text] in DIFF_OPTIONS"
              :key="val"
              :class="['toggle', { active: blackDifficulty === val }]"
            >
              <input
                type="radio"
                name="black-diff"
                :value="val"
                v-model="blackDifficulty"
                class="sr-only"
              />
              {{ text }}
            </label>
          </div>
        </section>
      </template>

      <!-- ── Theme ──────────────────────────────────────── -->
      <section class="section">
        <label class="section-label">Theme</label>
        <div class="toggle-group" role="radiogroup" aria-label="Theme">
          <label
            v-for="[val, text] in THEME_OPTIONS"
            :key="val"
            :class="['toggle', { active: theme === val }]"
            @click="applyTheme(val)"
          >
            <input
              type="radio"
              name="theme"
              :value="val"
              v-model="theme"
              class="sr-only"
            />
            {{ text }}
          </label>
        </div>
      </section>

      <button class="start-btn" @click="startGame">Start Game</button>
    </div>
  </main>
</template>

<style scoped>
.home {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Header ───────────────────────────────────────────────── */
.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.board-icon {
  display: grid;
  grid-template-rows: repeat(4, 14px);
  gap: 1px;
  flex-shrink: 0;
}

.icon-row {
  display: grid;
  grid-template-columns: repeat(4, 14px);
  gap: 1px;
}

.icon-sq {
  border-radius: 2px;
}

.icon-sq.dark {
  background: var(--board-dark);
}

.icon-sq.light {
  background: var(--board-light);
}

.title {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
}

/* ── Sections ─────────────────────────────────────────────── */
.section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

/* ── Toggle group ─────────────────────────────────────────── */
.toggle-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.85rem;
  min-height: 44px;
  border-radius: 5px;
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 0.875rem;
  cursor: pointer;
  touch-action: manipulation;
  transition:
    background 0.12s,
    border-color 0.12s,
    color 0.12s;
  user-select: none;
}

.toggle:hover {
  border-color: var(--text-muted);
  color: var(--text);
}

.toggle.active {
  background: var(--board-dark);
  border-color: var(--board-dark);
  color: #fff;
  font-weight: 600;
}

/* ── Side dots ────────────────────────────────────────────── */
.side-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.side-dot.red {
  background: var(--piece-red);
}

.side-dot.black {
  background: var(--piece-black);
  border: 1px solid var(--text-muted);
}

/* ── Start button ─────────────────────────────────────────── */
.start-btn {
  margin-top: 0.25rem;
  padding: 0.7rem;
  min-height: 48px;
  background: var(--accent);
  color: var(--accent-text);
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  touch-action: manipulation;
  transition: opacity 0.15s;
  letter-spacing: 0.02em;
}

.start-btn:hover {
  opacity: 0.88;
}

@media (max-width: 480px) {
  .card {
    padding: 1.25rem 1rem;
    gap: 1.1rem;
  }
}

/* ── Accessibility ────────────────────────────────────────── */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
