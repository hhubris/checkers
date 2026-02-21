# Checkers Game — Design Document

## 1. Overview

This document translates the requirements into a concrete
technical and visual design. It covers architecture, data
models, component structure, AI strategy, theming, and
accessibility implementation.

---

## 2. Architecture

The application is a single-page application (SPA) with a
clean separation between the game engine, AI, and UI layers.
No layer reaches across another's boundary.

```
┌─────────────────────────────────────┐
│              Vue 3 UI               │
│   (components, views, stores)       │
└────────────────┬────────────────────┘
                 │ reads / dispatches
┌────────────────▼────────────────────┐
│           Pinia Stores              │
│   (gameStore, settingsStore)        │
└──────┬─────────────────┬────────────┘
       │                 │
┌──────▼──────┐   ┌──────▼──────┐
│ Game Engine │   │  AI Module  │
│ (pure TS)   │   │  (pure TS)  │
└─────────────┘   └─────────────┘
```

The game engine and AI are plain TypeScript with no Vue
dependency. This makes them independently testable and
portable.

---

## 3. Project Structure

```
src/
  types/
    index.ts            # All shared TypeScript types

  engine/
    board.ts            # Board representation & utilities
    moves.ts            # Move generation & validation
    notation.ts         # Algebraic notation formatting
    gameState.ts        # State transitions (apply move, etc.)

  ai/
    index.ts            # Entry point; dispatches by difficulty
    random.ts           # Easy: random legal move
    heuristic.ts        # Medium: greedy scoring
    minimax.ts          # Hard: minimax + alpha-beta
    evaluation.ts       # Board evaluation function (shared)

  stores/
    gameStore.ts        # Active game state (Pinia)
    settingsStore.ts    # Theme, difficulty preferences (Pinia)

  components/
    board/
      BoardComponent.vue
      SquareComponent.vue
      PieceComponent.vue
    panels/
      MoveHistoryPanel.vue
      GameStatusBar.vue
    ui/
      HintButton.vue
      GameOverModal.vue
      ThemeSelector.vue

  views/
    HomeView.vue        # Setup screen
    GameView.vue        # Active game screen

  App.vue
  main.ts
  router.ts
```

---

## 4. Data Models

### 4.1 Core Types (`src/types/index.ts`)

```typescript
// Square numbers follow standard American checkers numbering:
// 1–32 (dark squares only, top-left of row 1 = square 1)
type SquareNumber = number  // 1–32

type Color = 'red' | 'black'
type Difficulty = 'easy' | 'medium' | 'hard'
type GameStatus = 'playing' | 'red-wins' | 'black-wins'
type PlayMode = 'hvh' | 'hva' | 'ava'

interface Piece {
  color: Color
  isKing: boolean
}

// Index 0 is unused; indices 1–32 represent squares
type Board = (Piece | null)[]

interface Move {
  from: SquareNumber
  to: SquareNumber
  captures: SquareNumber[]  // squares cleared during jump(s)
  promotesToKing: boolean
}

interface HistoryEntry {
  moveNumber: number        // 1-based, increments per full round
  color: Color
  move: Move
  notation: string          // e.g. "11-15" or "11x18x27"
}

interface GameState {
  board: Board
  currentTurn: Color
  moveHistory: HistoryEntry[]
  status: GameStatus
  capturedByRed: number     // count of black pieces captured
  capturedByBlack: number   // count of red pieces captured
}

// UI-only state lives in the Pinia store, not in GameState
interface UIState {
  selectedSquare: SquareNumber | null
  validMovesForSelected: Move[]
  hintedMoves: Move[]
  isAIThinking: boolean
  lastMove: Move | null
}
```

### 4.2 Board Numbering

Standard American checkers numbers only the 32 playable dark
squares, row by row, left to right from Black's side:

```
        Black's side
   ┌────┬────┬────┬────┐
 1 │ 01 │    │ 02 │    │
   ├────┼────┼────┼────┤
 2 │    │ 06 │    │ 07 │  ← row 2 right-side offset
   ├────┼────┼────┼────┤
         ... etc ...
   ├────┼────┼────┼────┤
 8 │ 29 │    │ 30 │    │
   └────┴────┴────┴────┘
        Red's side
```

The engine stores row-parity to correctly compute neighbors
for odd vs even rows.

---

## 5. Game Engine

### 5.1 `board.ts`
- `createInitialBoard(): Board`
- `getNeighbors(square, color, isKing): SquareNumber[]`
- `applyMove(board, move): Board`
- `cloneBoard(board): Board`

### 5.2 `moves.ts`
- `getLegalMoves(state): Move[]` — enforces mandatory jump rule;
  if any jumps exist, only jumps are returned
- `getJumpsFrom(board, square): Move[]` — recursive multi-jump
  expansion
- `getSimpleMoves(board, square, color, isKing): Move[]`

### 5.3 `gameState.ts`
- `applyMoveToState(state, move): GameState` — immutable; returns
  new state with updated board, turn, history, and status
- `detectStatus(board, nextTurn): GameStatus` — returns win if
  next player has no pieces or no moves
- `buildHistoryEntry(move, board, moveNumber, color): HistoryEntry`

### 5.4 `notation.ts`
- `toNotation(move): string`
  - Simple move: `"11-15"`
  - Single jump: `"11x18"`
  - Multi-jump: `"11x18x27"`

---

## 6. AI Module

All three levels share the same function signature:

```typescript
type AIPlayer = (state: GameState) => Move
```

### 6.1 Easy (`random.ts`)
Selects a random move from `getLegalMoves`. No lookahead.

### 6.2 Medium (`heuristic.ts`)
Scores each legal move using a greedy evaluation and picks
the highest-scoring move. No lookahead.

Scoring bonuses (applied to the resulting board):
| Condition              | Bonus |
|------------------------|-------|
| Capture per piece      | +10   |
| Promotion to king      | +7    |
| King on board          | +5    |
| Advancement (row)      | +1    |
| Center column          | +1    |

### 6.3 Hard (`minimax.ts`)
Minimax with alpha-beta pruning, targeting a search depth
of 8 ply (adjustable). Uses `evaluation.ts` to score leaf
nodes.

`evaluation.ts` scoring (from Red's perspective):
- Material: +1 per Red piece, -1 per Black piece
- King value: +5 per Red king, -5 per Black king
- Advancement: +0.1 per row advanced
- Center control: +0.15 for squares 11,12,15,16,17,20,21 (center 4)
- Mobility: +0.05 per legal move available

### 6.4 AI Timing
AI moves run asynchronously via a Web Worker to avoid
blocking the UI thread. A minimum artificial delay of 400ms
is applied on Easy and Medium so the AI doesn't feel
instantaneous.

---

## 7. Pinia Stores

### 7.1 `gameStore.ts`
Owns all game and UI state. Key actions:

| Action             | Description                              |
|--------------------|------------------------------------------|
| `startGame(config)`| Initialize a new game                    |
| `selectSquare(n)`  | Select a piece or confirm a move         |
| `requestHint()`    | Populate `hintedMoves`                   |
| `triggerAI()`      | Ask AI worker for a move, then apply it  |
| `resetGame()`      | Clear state, return to home              |

### 7.2 `settingsStore.ts`
Persisted to `localStorage`.

| Field        | Type         | Default     |
|--------------|--------------|-------------|
| `theme`      | `ThemeId`    | `'classic'` |
| `redPlayer`  | `PlayerType` | `'human'`   |
| `blackPlayer`| `PlayerType` | `'ai'`      |
| `difficulty` | `Difficulty` | `'medium'`  |

---

## 8. UI / Component Design

### 8.1 Routing

| Path    | View          | Description              |
|---------|---------------|--------------------------|
| `/`     | `HomeView`    | Setup screen             |
| `/game` | `GameView`    | Active game              |

### 8.2 Layout — Desktop (≥ 768px)

```
┌─────────────────────────────────────────────┐
│                   Header                    │
│          [Theme] [New Game] [Menu]          │
├──────────────────────────┬──────────────────┤
│                          │                  │
│       Board (8×8)        │  Move History    │
│       (square, grows     │  (scrollable)    │
│        to fill space)    │                  │
│                          ├──────────────────┤
│                          │   Status Bar     │
│                          │  Red ●  Black ●  │
│                          │  Captured: 0 / 0 │
├──────────────────────────┴──────────────────┤
│  [Hint]           Turn: Red         [Reset] │
└─────────────────────────────────────────────┘
```

### 8.3 Layout — Mobile (< 768px)

```
┌───────────────────┐
│      Header       │
├───────────────────┤
│  Turn: Red  ●     │
│  Captured: 0 / 0  │
├───────────────────┤
│                   │
│    Board (8×8)    │
│   (full width)    │
│                   │
├───────────────────┤
│ [Hint]   [Reset]  │
├───────────────────┤
│  ▼ Move History   │  ← collapsible accordion
│  (collapsed)      │
└───────────────────┘
```

### 8.4 Component Responsibilities

**`BoardComponent.vue`**
- Renders an 8×8 grid
- Applies `role="grid"` and manages roving `tabindex` across
  squares for keyboard navigation
- Translates square numbers to grid positions accounting for
  row-parity offset

**`SquareComponent.vue`**
- `role="gridcell"`
- Visual states: default, highlighted (valid move target),
  hinted, last-move
- Emits `click` and `keydown` (Enter/Space) to parent

**`PieceComponent.vue`**
- Renders piece as a styled circle with a crown overlay for
  kings
- `aria-label` updates reactively (e.g. "Red king, selected")
- CSS transition handles movement animation

**`MoveHistoryPanel.vue`**
- Scrollable `<ol>` of notation entries
- Most recent entry is highlighted
- Auto-scrolls to bottom on new entry

**`GameOverModal.vue`**
- Overlay with winner announcement
- Focuses automatically when shown (trap focus inside modal)
- [Play Again] and [Main Menu] buttons

---

## 9. Keyboard Navigation

| Key              | Action                                      |
|------------------|---------------------------------------------|
| Arrow keys       | Move focus between squares on the board     |
| Enter / Space    | Select focused piece, or confirm move       |
| Escape           | Cancel current selection                    |
| H                | Request a hint                              |
| Tab              | Move between UI controls (outside board)    |

The board uses a **roving tabindex** pattern: only one square
has `tabindex="0"` at a time; all others are `tabindex="-1"`.
Arrow keys update which square holds `tabindex="0"` and call
`.focus()` on it.

---

## 10. ARIA / Screen Reader Implementation

```html
<!-- Board container -->
<div role="grid" aria-label="Checkers board">

  <!-- Each row -->
  <div role="row" v-for="row in rows">

    <!-- Each square -->
    <div
      role="gridcell"
      :aria-label="squareLabel(square)"
      :aria-selected="isSelected(square)"
      :tabindex="focusedSquare === square ? 0 : -1"
    />

  </div>
</div>

<!-- Off-screen live region for move announcements -->
<div
  aria-live="polite"
  aria-atomic="true"
  class="sr-only"
>{{ announcement }}</div>
```

**`squareLabel` examples:**
- Empty dark square: `"Square 14"`
- Occupied: `"Square 14, red king"`
- Selected: `"Square 14, red king, selected"`
- Valid target: `"Square 18, move destination"`

**Announcement examples (via live region):**
- `"Red moves from 11 to 15."`
- `"Black jumps from 22 to 13, red piece captured."`
- `"Red is kinged on square 4."`
- `"Red wins. Black has no remaining moves."`

---

## 11. Theming

Themes are implemented as CSS custom property sets scoped
to a `data-theme` attribute on `<html>`.

```css
[data-theme="classic"] {
  --board-light: #f0d9b5;
  --board-dark:  #b58863;
  --piece-red:   #cc2200;
  --piece-black: #1a1a1a;
  --piece-crown: #ffd700;
  --highlight:   rgba(255, 255, 100, 0.6);
  --hint:        rgba(0, 200, 100, 0.5);
}

[data-theme="ocean"] {
  --board-light: #cce8f4;
  --board-dark:  #2e6da4;
  --piece-red:   #ffffff;
  --piece-black: #003366;
  --piece-crown: #ffd700;
  --highlight:   rgba(255, 255, 100, 0.6);
  --hint:        rgba(0, 255, 150, 0.5);
}
```

The designer controls all values within these variables and
may add additional properties (e.g. border radii, gradients,
font choices) without touching component logic.

---

## 12. Animations

All animations use CSS transitions or `@keyframes`. No
JavaScript animation libraries are required.

| Event               | Animation                                    |
|---------------------|----------------------------------------------|
| Piece move          | CSS `transform: translate()` transition      |
| Jump sequence       | Sequential translate steps with short delay  |
| Piece captured      | Fade out + scale down before removal         |
| Kinging             | Crown icon scales in with a bounce keyframe  |
| Valid move hint     | Subtle pulse on highlighted squares          |
| Game over           | Modal fades in with a slight scale-up        |

Animations respect `prefers-reduced-motion`: all transitions
fall back to instant when the user has enabled reduced motion.

---

## 13. Testing Strategy

| Layer        | Tool    | What is tested                              |
|--------------|---------|---------------------------------------------|
| Engine       | Vitest  | Move generation, jump rules, win detection, |
|              |         | notation, state transitions                 |
| AI           | Vitest  | Determinism (Easy), scoring, no illegal     |
|              |         | moves returned                              |
| Stores       | Vitest  | State mutations, action flows               |
| Components   | Vitest  | Unit tests via Vue Test Utils               |
|              | + JSDOM | (slot rendering, emits, ARIA attributes)    |
| E2E          | Playwright | Full game flows in Chrome and Firefox    |
|              |         | Keyboard-only game completion               |
|              |         | AI vs AI game runs to completion            |

---

## 14. Build & Dev Tooling

| Tool       | Purpose                                   |
|------------|-------------------------------------------|
| mise       | Tool version manager (Node, etc.)         |
| Vite       | Dev server and production bundler         |
| Vitest     | Unit and component testing                |
| Playwright | End-to-end tests (Chrome + Firefox)       |
| ESLint     | Linting (Vue + TypeScript rules)          |
| Prettier   | Code formatting                           |
| TypeScript | Strict mode (`"strict": true`)            |

`mise` is the single source of truth for tool versions. All
required runtimes (e.g. Node) are declared in
`.config/mise/config.toml` and installed via `mise install`.

### Git Workflow

All commits must follow the **Conventional Commits**
specification (https://www.conventionalcommits.org).

Format: `<type>(<scope>): <description>`

| Type       | When to use                              |
|------------|------------------------------------------|
| `feat`     | New feature or capability                |
| `fix`      | Bug fix                                  |
| `docs`     | Documentation changes only               |
| `style`    | Formatting, no logic change              |
| `refactor` | Code restructure, no behavior change     |
| `test`     | Adding or updating tests                 |
| `chore`    | Build config, tooling, dependencies      |

Scope (optional) should name the affected module, e.g.
`engine`, `ai`, `board`, `store`, `a11y`.

**Branching strategy: commit directly to main.**
Commit each completed story directly to main and push.
