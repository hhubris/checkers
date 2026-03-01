import { defineStore } from 'pinia'
import type { Difficulty, PlayerType, ThemeId } from '../types'

interface SettingsState {
  theme: ThemeId
  redPlayer: PlayerType
  blackPlayer: PlayerType
  redDifficulty: Difficulty
  blackDifficulty: Difficulty
}

const STORAGE_KEY = 'checkers-settings'

const VALID_THEMES = new Set<ThemeId>(['classic', 'ocean'])
const VALID_DIFFICULTIES = new Set<Difficulty>(['easy', 'medium', 'hard'])
const VALID_PLAYERS = new Set<PlayerType>(['human', 'ai'])

function sanitize(raw: Record<string, unknown>): Partial<SettingsState> {
  const clean: Partial<SettingsState> = {}
  if (VALID_THEMES.has(raw.theme as ThemeId)) clean.theme = raw.theme as ThemeId
  if (VALID_PLAYERS.has(raw.redPlayer as PlayerType)) clean.redPlayer = raw.redPlayer as PlayerType
  if (VALID_PLAYERS.has(raw.blackPlayer as PlayerType)) clean.blackPlayer = raw.blackPlayer as PlayerType
  if (VALID_DIFFICULTIES.has(raw.redDifficulty as Difficulty)) clean.redDifficulty = raw.redDifficulty as Difficulty
  if (VALID_DIFFICULTIES.has(raw.blackDifficulty as Difficulty)) clean.blackDifficulty = raw.blackDifficulty as Difficulty
  return clean
}

function loadFromStorage(): Partial<SettingsState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return {}
    return sanitize(parsed as Record<string, unknown>)
  } catch {
    return {}
  }
}

function defaults(): SettingsState {
  return {
    theme: 'classic',
    redPlayer: 'human',
    blackPlayer: 'ai',
    redDifficulty: 'medium',
    blackDifficulty: 'medium',
  }
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({ ...defaults(), ...loadFromStorage() }),

  actions: {
    setTheme(id: ThemeId) {
      this.theme = id
      document.documentElement.setAttribute('data-theme', id)
      this._save()
    },

    setPlayers(config: {
      redPlayer: PlayerType
      blackPlayer: PlayerType
      redDifficulty?: Difficulty
      blackDifficulty?: Difficulty
    }) {
      this.redPlayer = config.redPlayer
      this.blackPlayer = config.blackPlayer
      if (config.redDifficulty) this.redDifficulty = config.redDifficulty
      if (config.blackDifficulty) this.blackDifficulty = config.blackDifficulty
      this._save()
    },

    _save() {
      const data: SettingsState = {
        theme: this.theme,
        redPlayer: this.redPlayer,
        blackPlayer: this.blackPlayer,
        redDifficulty: this.redDifficulty,
        blackDifficulty: this.blackDifficulty,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    },
  },
})
