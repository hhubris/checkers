import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from './settingsStore'

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('settingsStore', () => {
  it('has correct defaults', () => {
    const store = useSettingsStore()
    expect(store.theme).toBe('classic')
    expect(store.redPlayer).toBe('human')
    expect(store.blackPlayer).toBe('ai')
    expect(store.redDifficulty).toBe('medium')
    expect(store.blackDifficulty).toBe('medium')
  })

  it('setTheme updates theme and persists to localStorage', () => {
    const store = useSettingsStore()
    store.setTheme('ocean')
    expect(store.theme).toBe('ocean')
    const saved = JSON.parse(localStorage.getItem('checkers-settings')!)
    expect(saved.theme).toBe('ocean')
  })

  it('setTheme sets data-theme on <html>', () => {
    const store = useSettingsStore()
    store.setTheme('ocean')
    expect(document.documentElement.getAttribute('data-theme')).toBe('ocean')
  })

  it('setPlayers updates player config and persists', () => {
    const store = useSettingsStore()
    store.setPlayers({
      redPlayer: 'ai',
      blackPlayer: 'human',
      redDifficulty: 'hard',
      blackDifficulty: 'easy',
    })
    expect(store.redPlayer).toBe('ai')
    expect(store.blackPlayer).toBe('human')
    expect(store.redDifficulty).toBe('hard')
    expect(store.blackDifficulty).toBe('easy')
    const saved = JSON.parse(localStorage.getItem('checkers-settings')!)
    expect(saved.redPlayer).toBe('ai')
  })

  it('loads persisted settings on init', () => {
    localStorage.setItem(
      'checkers-settings',
      JSON.stringify({ theme: 'ocean', redPlayer: 'ai', blackPlayer: 'human',
        redDifficulty: 'hard', blackDifficulty: 'easy' }),
    )
    const store = useSettingsStore()
    expect(store.theme).toBe('ocean')
    expect(store.redPlayer).toBe('ai')
  })
})
