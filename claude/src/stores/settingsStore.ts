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

function loadFromStorage(): Partial<SettingsState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Partial<SettingsState>) : {}
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
