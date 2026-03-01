import type { Difficulty, GameState, Move } from '../types'
import { getAIMove } from './index'

interface WorkerRequest {
  state: GameState
  difficulty: Difficulty
}

interface WorkerResponse {
  move?: Move
  error?: string
}

self.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  try {
    const { state, difficulty } = event.data
    const move = getAIMove(state, difficulty)
    self.postMessage({ move } satisfies WorkerResponse)
  } catch (err) {
    self.postMessage({ error: String(err) } satisfies WorkerResponse)
  }
})
