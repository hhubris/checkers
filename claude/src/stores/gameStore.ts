import { defineStore } from 'pinia'
import { useSettingsStore } from './settingsStore'
import { createInitialGameState, applyMoveToState } from '../engine/gameState'
import { getLegalMoves } from '../engine/moves'
import { getAIMove } from '../ai/index'
import { getHeuristicMove } from '../ai/heuristic'
import type { GameState, Move, SquareNumber, UIState } from '../types'

const AI_MIN_DELAY_MS = 400

function initialUIState(): UIState {
  return {
    selectedSquare: null,
    validMovesForSelected: [],
    hintedMoves: [],
    isAIThinking: false,
    lastMove: null,
  }
}

export const useGameStore = defineStore('game', {
  state: () => ({
    gameState: null as GameState | null,
    uiState: initialUIState(),
  }),

  actions: {
    startGame() {
      this.gameState = createInitialGameState()
      this.uiState = initialUIState()

      const settings = useSettingsStore()
      document.documentElement.setAttribute('data-theme', settings.theme)

      if (this._isAITurn()) this.triggerAI()
    },

    selectSquare(n: SquareNumber) {
      const gs = this.gameState
      if (!gs || gs.status !== 'playing') return

      const settings = useSettingsStore()
      const currentPlayer =
        gs.currentTurn === 'red' ? settings.redPlayer : settings.blackPlayer
      if (currentPlayer !== 'human') return

      const ui = this.uiState

      // If a piece is already selected, try to apply a move to n
      if (ui.selectedSquare !== null) {
        const move = ui.validMovesForSelected.find((m) => m.to === n)
        if (move) {
          this._applyMove(move)
          return
        }
      }

      // Select the piece at n if it belongs to the current player
      const piece = gs.board[n]
      if (piece && piece.color === gs.currentTurn) {
        const legalMoves = getLegalMoves(gs)
        const movesFromN = legalMoves.filter((m) => m.from === n)
        this.uiState = {
          ...ui,
          selectedSquare: n,
          validMovesForSelected: movesFromN,
          hintedMoves: [],
        }
      } else {
        // Clicked empty square or opponent's piece — deselect
        this.uiState = { ...ui, selectedSquare: null, validMovesForSelected: [] }
      }
    },

    _applyMove(move: Move) {
      if (!this.gameState) return
      this.gameState = applyMoveToState(this.gameState, move)
      this.uiState = { ...initialUIState(), lastMove: move }
      if (this._isAITurn()) this.triggerAI()
    },

    async triggerAI() {
      if (!this.gameState || this.gameState.status !== 'playing') return

      this.uiState = { ...this.uiState, isAIThinking: true }

      const settings = useSettingsStore()
      const difficulty =
        this.gameState.currentTurn === 'red'
          ? settings.redDifficulty
          : settings.blackDifficulty

      const stateCopy = this.gameState
      const [move] = await Promise.all([
        Promise.resolve(getAIMove(stateCopy, difficulty)),
        new Promise((r) => setTimeout(r, AI_MIN_DELAY_MS)),
      ])

      // State may have changed while we waited (e.g. game reset)
      if (!this.gameState || this.gameState !== stateCopy) return

      this.uiState = { ...this.uiState, isAIThinking: false }
      this._applyMove(move as Move)
    },

    requestHint() {
      const gs = this.gameState
      if (!gs || gs.status !== 'playing') return
      const hint = getHeuristicMove(gs)
      this.uiState = { ...this.uiState, hintedMoves: [hint] }
    },

    deselect() {
      this.uiState = {
        ...this.uiState,
        selectedSquare: null,
        validMovesForSelected: [],
      }
    },

    resetGame() {
      this.gameState = null
      this.uiState = initialUIState()
    },

    _isAITurn(): boolean {
      const gs = this.gameState
      if (!gs || gs.status !== 'playing') return false
      const settings = useSettingsStore()
      const player =
        gs.currentTurn === 'red' ? settings.redPlayer : settings.blackPlayer
      return player === 'ai'
    },
  },
})
