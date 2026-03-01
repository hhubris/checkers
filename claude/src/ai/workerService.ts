import type { Difficulty, GameState, Move } from '../types'

let aiWorker: Worker | null = null
let workerToken = 0

function getWorker(): Worker {
  if (!aiWorker) {
    aiWorker = new Worker(new URL('./worker.ts', import.meta.url), {
      type: 'module',
    })
  }
  return aiWorker
}

export function terminateWorker(): void {
  if (aiWorker) {
    aiWorker.terminate()
    aiWorker = null
  }
  // Increment token so any in-flight promise is silently ignored.
  workerToken++
}

export function askWorker(state: GameState, difficulty: Difficulty): Promise<Move> {
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
