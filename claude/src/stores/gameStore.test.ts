import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from './gameStore'
import { useSettingsStore } from './settingsStore'

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('gameStore — startGame', () => {
  it('produces a valid initial GameState', () => {
    const settings = useSettingsStore()
    settings.setPlayers({ redPlayer: 'human', blackPlayer: 'human' })
    const store = useGameStore()
    store.startGame()
    expect(store.gameState).not.toBeNull()
    expect(store.gameState!.status).toBe('playing')
    expect(store.gameState!.currentTurn).toBe('black')
    expect(store.gameState!.moveHistory).toHaveLength(0)
  })

  it('clears UI state', () => {
    const settings = useSettingsStore()
    settings.setPlayers({ redPlayer: 'human', blackPlayer: 'human' })
    const store = useGameStore()
    store.startGame()
    expect(store.uiState.selectedSquare).toBeNull()
    expect(store.uiState.validMovesForSelected).toHaveLength(0)
    expect(store.uiState.isAIThinking).toBe(false)
  })
})

describe('gameStore — selectSquare', () => {
  it('selects a piece belonging to the current player', () => {
    const settings = useSettingsStore()
    settings.setPlayers({ redPlayer: 'human', blackPlayer: 'human' })
    const store = useGameStore()
    store.startGame()
    // Black moves first; square 9 has a black piece
    store.selectSquare(9)
    expect(store.uiState.selectedSquare).toBe(9)
    expect(store.uiState.validMovesForSelected.length).toBeGreaterThan(0)
  })

  it('does not select an opponent piece', () => {
    const settings = useSettingsStore()
    settings.setPlayers({ redPlayer: 'human', blackPlayer: 'human' })
    const store = useGameStore()
    store.startGame()
    // Red piece on sq 21 — but it is black's turn
    store.selectSquare(21)
    expect(store.uiState.selectedSquare).toBeNull()
  })

  it('applies a move when a valid destination is clicked', () => {
    const settings = useSettingsStore()
    settings.setPlayers({ redPlayer: 'human', blackPlayer: 'human' })
    const store = useGameStore()
    store.startGame()
    store.selectSquare(9)
    const dest = store.uiState.validMovesForSelected[0]!.to
    store.selectSquare(dest)
    expect(store.gameState!.currentTurn).toBe('red')
    expect(store.uiState.selectedSquare).toBeNull()
  })

  it('deselects when an invalid square is clicked', () => {
    const settings = useSettingsStore()
    settings.setPlayers({ redPlayer: 'human', blackPlayer: 'human' })
    const store = useGameStore()
    store.startGame()
    store.selectSquare(9)
    store.selectSquare(1) // another black piece — reselects
    // sq 1 is a black piece so it will reselect, not deselect
    // Click an empty square instead (sq 13 is empty at start)
    store.selectSquare(13)
    expect(store.uiState.selectedSquare).toBeNull()
  })

  it('does nothing when it is an AI turn', () => {
    // Default: blackPlayer = 'ai'
    const store = useGameStore()
    store.startGame()
    // Black's turn; black is AI — human click should do nothing
    // (triggerAI fires but is async, we just check selectSquare is blocked)
    const stateBefore = store.uiState.selectedSquare
    store.selectSquare(9)
    expect(store.uiState.selectedSquare).toBe(stateBefore)
  })
})

describe('gameStore — requestHint', () => {
  it('populates hintedMoves on a human turn', () => {
    const settings = useSettingsStore()
    settings.setPlayers({ redPlayer: 'human', blackPlayer: 'human' })
    const store = useGameStore()
    store.startGame()
    store.requestHint()
    expect(store.uiState.hintedMoves.length).toBeGreaterThan(0)
  })
})

describe('gameStore — resetGame', () => {
  it('clears game state and UI state', () => {
    const store = useGameStore()
    store.startGame()
    store.resetGame()
    expect(store.gameState).toBeNull()
    expect(store.uiState.selectedSquare).toBeNull()
  })
})
