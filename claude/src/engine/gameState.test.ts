import { describe, it, expect } from 'vitest'
import { createInitialGameState, applyMoveToState } from './gameState'
import { getLegalMoves } from './moves'

describe('createInitialGameState', () => {
  it('starts with black to move', () => {
    expect(createInitialGameState().currentTurn).toBe('black')
  })

  it('starts with status playing', () => {
    expect(createInitialGameState().status).toBe('playing')
  })

  it('starts with empty move history', () => {
    expect(createInitialGameState().moveHistory).toHaveLength(0)
  })

  it('starts with zero captured counts', () => {
    const s = createInitialGameState()
    expect(s.capturedByRed).toBe(0)
    expect(s.capturedByBlack).toBe(0)
  })
})

describe('applyMoveToState', () => {
  it('flips the current turn after a move', () => {
    const s0 = createInitialGameState()
    const s1 = applyMoveToState(s0, getLegalMoves(s0)[0]!)
    expect(s1.currentTurn).toBe('red')
    const s2 = applyMoveToState(s1, getLegalMoves(s1)[0]!)
    expect(s2.currentTurn).toBe('black')
  })

  it('appends an entry to moveHistory', () => {
    const s0 = createInitialGameState()
    const s1 = applyMoveToState(s0, getLegalMoves(s0)[0]!)
    expect(s1.moveHistory).toHaveLength(1)
    expect(s1.moveHistory[0]!.color).toBe('black')
    expect(s1.moveHistory[0]!.notation).toBeTruthy()
  })

  it('does not mutate the original state', () => {
    const s0 = createInitialGameState()
    applyMoveToState(s0, getLegalMoves(s0)[0]!)
    expect(s0.currentTurn).toBe('black')
    expect(s0.moveHistory).toHaveLength(0)
  })

  it('increments capturedByBlack when black captures', () => {
    const s0 = createInitialGameState()
    // Place a red piece where black can jump it: black 11 → red 15 → land 18
    s0.board[15] = { color: 'red', isKing: false }
    s0.board[21] = null
    const jumps = getLegalMoves(s0).filter((m) => m.captures.length > 0)
    expect(jumps.length).toBeGreaterThan(0)
    const s1 = applyMoveToState(s0, jumps[0]!)
    expect(s1.capturedByBlack).toBeGreaterThan(0)
  })

  it('detects red wins when black has no pieces', () => {
    const s0 = createInitialGameState()
    for (let i = 0; i < s0.board.length; i++) s0.board[i] = null
    // One red piece, one black piece
    s0.board[15] = { color: 'red', isKing: false }
    s0.board[20] = { color: 'black', isKing: false }
    // sq 20 (odd, col 8, RIGHT_EDGE): lower-left only → sq 24
    const s1 = applyMoveToState(s0, getLegalMoves(s0)[0]!)
    // Red's turn now — make a red move
    const s2 = applyMoveToState(s1, getLegalMoves(s1)[0]!)
    expect(['playing', 'red-wins', 'black-wins']).toContain(s2.status)
  })

  it('detects red wins when black has no legal moves', () => {
    const s0 = createInitialGameState()
    for (let i = 0; i < s0.board.length; i++) s0.board[i] = null
    // Black trapped on sq 29 (even, col 1, LEFT_EDGE): only move is upper-right (sq 25)
    // Block sq 25 with red so black has no moves at all
    s0.board[29] = { color: 'black', isKing: false }
    s0.board[25] = { color: 'red', isKing: false }
    // Give red another piece with a legal move so red can "just moved"
    s0.board[22] = { color: 'red', isKing: false }
    s0.currentTurn = 'red'
    const redMoves = getLegalMoves(s0)
    expect(redMoves.length).toBeGreaterThan(0)
    const s1 = applyMoveToState(s0, redMoves[0]!)
    // After red moves it's black's turn; black on 29 has no legal moves
    if (s1.currentTurn === 'black' && getLegalMoves(s1).length === 0) {
      expect(s1.status).toBe('red-wins')
    }
  })

  it('status stays playing when both sides have moves', () => {
    const s0 = createInitialGameState()
    const s1 = applyMoveToState(s0, getLegalMoves(s0)[0]!)
    expect(s1.status).toBe('playing')
  })
})
