import { defineStore } from 'pinia'
import { useSettingsStore } from './settingsStore'
import { createInitialGameState, applyMoveToState } from '../engine/gameState'
import { getLegalMoves } from '../engine/moves'
import { getAIMove } from '../ai/index'
import { getHeuristicMove } from '../ai/heuristic'
import type { Difficulty, GameState, Move, SquareNumber, UIState } from '../types'

const AI_MIN_DELAY_MS = 400

// ── Web Worker management ────────────────────────────────────
// Kept outside the Pinia store because Worker instances are
// non-serializable and should not be reactive.

let aiWorker: Worker | null = null
let workerToken = 0

function getWorker(): Worker {
  if (!aiWorker) {
    aiWorker = new Worker(new URL('../ai/worker.ts', import.meta.url), {
      type: 'module',
    })
  }
  return aiWorker
}

function terminateWorker() {
  if (aiWorker) {
    aiWorker.terminate()
    aiWorker = null
  }
  // Increment token so any in-flight promise is silently ignored.
  workerToken++
}

function askWorker(state: GameState, difficulty: Difficulty): Promise<Move> {
  const token = ++workerToken
  const worker = getWorker()

  return new Promise<Move>((resolve, reject) => {
    worker.onmessage = (e: MessageEvent<{ move?: Move; error?: string }>) => {
      if (workerToken !== token) return
      if (e.data.error) reject(new Error(e.data.error))
      else if (e.data.move !== undefined) resolve(e.data.move)
    }
    worker.onerror = (e) => {
      if (workerToken === token) reject(new Error(e.message))
    }
    worker.postMessage({ state, difficulty })
  })
}

// ── Store ────────────────────────────────────────────────────

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

  getters: {
    // Squares whose pieces must capture this turn. Only populated for the
    // human player before a piece is selected; empty during AI turns.
    mustJumpSquares(): Set<SquareNumber> {
      const gs = this.gameState
      if (!gs || gs.status !== 'playing') return new Set()
      if (this.uiState.selectedSquare !== null) return new Set()
      const settings = useSettingsStore()
      const currentPlayer =
        gs.currentTurn === 'red' ? settings.redPlayer : settings.blackPlayer
      if (currentPlayer !== 'human') return new Set()
      const moves = getLegalMoves(gs)
      if (!moves.some((m) => m.captures.length > 0)) return new Set()
      return new Set(moves.filter((m) => m.captures.length > 0).map((m) => m.from))
    },
  },

  actions: {
    startGame() {
      terminateWorker()
      this.gameState = createInitialGameState()
      this.uiState = initialUIState()

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

      let move: Move
      try {
        const [result] = await Promise.all([
          askWorker(stateCopy, difficulty),
          new Promise<void>((r) => setTimeout(r, AI_MIN_DELAY_MS)),
        ])
        move = result
      } catch (err) {
        console.error('[AI Worker] failed, falling back to main thread:', err)
        // Keep the minimum delay so Vue can render each move before the
        // next one begins, even on the main thread.
        await new Promise<void>((r) => setTimeout(r, AI_MIN_DELAY_MS))
        move = getAIMove(stateCopy, difficulty)
      }

      // Game was reset or a new game started while we were waiting.
      if (!this.gameState || this.gameState !== stateCopy) return

      this.uiState = { ...this.uiState, isAIThinking: false }
      this._applyMove(move)
    },

    requestHint() {
      const gs = this.gameState
      if (!gs || gs.status !== 'playing') return
      // Hints use the fast heuristic — no need for a worker.
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
      terminateWorker()
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
