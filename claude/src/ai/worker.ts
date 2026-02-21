import type { Difficulty, GameState, Move } from '../types'
import { getAIMove } from './index'

interface WorkerRequest {
  state: GameState
  difficulty: Difficulty
}

interface WorkerResponse {
  move: Move
}

self.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  const { state, difficulty } = event.data
  const move = getAIMove(state, difficulty)
  const response: WorkerResponse = { move }
  self.postMessage(response)
})
