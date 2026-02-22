# Checkers Game — Story List

Stories are grouped into phases. Each phase produces
something runnable. Complete all stories in a phase before
moving to the next. Stories within a phase may be done in
any order unless a dependency is noted.

**Status legend:** ✅ Complete · ⬜ Not started

---

## Phase 1 — Project Scaffold

### ✅ S-01 · Initialize Vite + Vue + TypeScript project
Set up the project using `npm create vite@latest` with the
Vue + TypeScript template. Confirm the dev server starts
and renders the default page.

Acceptance:
- `npm run dev` starts without errors
- Browser shows default Vite/Vue page at localhost

### ✅ S-02 · Install and configure dependencies
Install: `vue-router`, `pinia`, `vitest`, `@vue/test-utils`,
`playwright` (or `@playwright/test`). Add `eslint` and
`prettier` with Vue + TypeScript rules. Add a `strict: true`
`tsconfig.json`.

Acceptance:
- `npm run lint` passes on starter files
- `npm run test` runs (zero tests, zero failures)

### ✅ S-03 · Set up routing
Create `src/router.ts` with two routes: `/` → `HomeView`
and `/game` → `GameView`. Create placeholder view
components. Wire router into `main.ts` and `App.vue`.

Acceptance:
- Navigating to `/` renders HomeView placeholder
- Navigating to `/game` renders GameView placeholder

### ✅ S-04 · Set up Pinia
Install and register Pinia in `main.ts`. Create empty
`gameStore.ts` and `settingsStore.ts` stubs. Confirm store
can be accessed from a component.

Acceptance:
- A component can import and read from a Pinia store
  without runtime errors

---

## Phase 2 — Core Types & Game Engine

### ✅ S-05 · Define shared TypeScript types
Create `src/types/index.ts` with all types from the design
document: `Color`, `Difficulty`, `GameStatus`, `PlayMode`,
`Piece`, `Board`, `Move`, `HistoryEntry`, `GameState`,
`UIState`, `PlayerType`, `ThemeId`.

Acceptance:
- File compiles with no TypeScript errors
- No `any` types used

### ✅ S-06 · Implement board representation
Create `src/engine/board.ts`:
- `createInitialBoard(): Board` — 12 red pieces on squares
  21–32, 12 black pieces on squares 1–12
- `getNeighbors(square, color, isKing): SquareNumber[]` —
  returns valid diagonal neighbors given row parity
- `cloneBoard(board): Board`
- `applyMove(board, move): Board` — places piece at `to`,
  clears `from` and all `captures`, promotes if
  `promotesToKing`

Acceptance:
- Unit tests confirm initial piece placement
- Unit tests confirm neighbor calculation for corner
  squares, edge squares, and center squares for both row
  parities
- Unit tests confirm `applyMove` clears captured squares

### ✅ S-07 · Implement move generation
Create `src/engine/moves.ts`:
- `getSimpleMoves(board, square): Move[]`
- `getJumpsFrom(board, square): Move[]` — recursive
  multi-jump expansion; a piece cannot revisit a square in
  one turn; a piece that is kinged mid-sequence ends the
  sequence immediately
- `getLegalMoves(state): Move[]` — if any jump exists for
  any piece of the current color, return only jumps
  (mandatory jump rule)

Acceptance:
- Unit test: a piece with no neighbors returns no moves
- Unit test: a piece with an empty diagonal returns one
  simple move
- Unit test: a piece with an enemy piece and landing square
  returns a jump
- Unit test: multi-jump sequences are fully expanded
- Unit test: mandatory jump — when a jump exists, simple
  moves are excluded
- Unit test: kings can move and jump backward
- Unit test: a jump that kings a piece ends the sequence
  immediately

### ✅ S-08 · Implement game state transitions
Create `src/engine/gameState.ts`:
- `applyMoveToState(state, move): GameState` — immutable;
  returns new state with updated board, toggled turn,
  appended history, updated capture counts, incremented
  `movesSinceCapture`, and computed status
- `detectStatus(board, nextTurn, movesSinceCapture):
  GameStatus` — returns `'playing'`, a winner if the next
  player has no pieces or no legal moves, or `'draw'` after
  40 consecutive half-moves without a capture
  (`DRAW_MOVE_LIMIT = 40`)
- `createInitialGameState(): GameState`

Acceptance:
- Unit test: applying a move flips the current turn
- Unit test: applying a capture increments the capture
  count and resets `movesSinceCapture`
- Unit test: a board where one side has no pieces returns
  the correct winner
- Unit test: a board where one side has pieces but no legal
  moves returns the correct winner
- Unit test: `movesSinceCapture` reaches `DRAW_MOVE_LIMIT`
  on a non-capture move → status is `'draw'`

### ✅ S-09 · Implement move notation
Create `src/engine/notation.ts`:
- `toNotation(move): string`
  - Simple: `"11-15"`
  - Single jump: `"11x18"`
  - Multi-jump: `"11x18x27"`

Acceptance:
- Unit tests for a simple move, single jump, and multi-jump
- Unit tests confirm correct square numbers appear in output

---

## Phase 3 — AI

### ✅ S-10 · Implement Easy AI
Create `src/ai/random.ts`:
- `getRandomMove(state: GameState): Move` — picks a random
  move from `getLegalMoves`

Acceptance:
- Unit test: always returns a legal move
- Unit test: never returns a move when the game is over

### ✅ S-11 · Implement board evaluation function
Create `src/ai/evaluation.ts`:
- `evaluate(board, color): number` — scores the board from
  `color`'s perspective using material, king value,
  advancement, center control, and mobility weights

Acceptance:
- Unit test: an empty board scores 0
- Unit test: a board with one extra red piece scores
  positively for Red
- Unit test: a king is worth more than a regular piece

### ✅ S-12 · Implement Medium AI
Create `src/ai/heuristic.ts`:
- `getHeuristicMove(state: GameState): Move` — evaluates
  each legal move's resulting board with `evaluate()` and
  picks the highest-scoring one; ties broken randomly

Acceptance:
- Unit test: prefers a capture move over a simple move when
  one is available
- Unit test: prefers a kinging move over a non-kinging
  move when capture counts are equal

### ✅ S-13 · Implement Hard AI (minimax)
Create `src/ai/minimax.ts`:
- `getMinimaxMove(state: GameState, depth?: number): Move`
  — minimax with alpha-beta pruning, default depth 8; ties
  broken randomly among equally-scored moves

Acceptance:
- Unit test: does not return an illegal move
- Unit test: recognizes a forced win in 1 move
- Unit test: completes within 5 seconds for a typical
  mid-game position at depth 8

### ✅ S-14 · Create AI entry point and Web Worker
Create `src/ai/index.ts`:
- `getAIMove(state: GameState, difficulty: Difficulty):
  Move` — dispatches to the correct implementation

Create `src/ai/worker.ts` as a Web Worker wrapper that
accepts a `GameState` + `Difficulty` message and posts back
a `Move`. The store manages the worker lifecycle with a
cancel token; falls back to main-thread computation if the
worker fails to initialize.

Acceptance:
- Calling `getAIMove` with each difficulty returns a legal
  move
- The worker can be instantiated and responds to a message
- Cancellation via token prevents stale moves from being
  applied after the game ends or resets

---

## Phase 4 — Pinia Stores

### ✅ S-15 · Implement settingsStore
`src/stores/settingsStore.ts`:
- State: `theme`, `redPlayer`, `blackPlayer`,
  `redDifficulty`, `blackDifficulty`
- Persisted to `localStorage` via watcher
- Actions: `setTheme(id)`, `setPlayers(config)`

Acceptance:
- Settings survive a page reload
- Changing theme updates the stored value

### ✅ S-16 · Implement gameStore
`src/stores/gameStore.ts`:
- State: `gameState`, `uiState` (`selectedSquare`,
  `validMovesForSelected`, `hintedMoves`, `isAIThinking`,
  `lastMove`)
- Actions:
  - `startGame()` — initializes state from settingsStore
    config
  - `selectSquare(n)` — first call selects a piece (if
    belonging to current human player), second call applies
    the move if `n` is a valid destination, otherwise
    reselects
  - `applyMove(move)` — applies move to engine state,
    clears UI state, checks for AI turn and triggers AI
  - `requestHint()` — runs Medium AI, stores result in
    `hintedMoves`
  - `triggerAI()` — posts to AI worker, awaits response,
    applies move with a minimum 400 ms delay
  - `resetGame()` — clears game state, navigates to `/`

Acceptance:
- `startGame()` produces a valid initial `GameState`
- Selecting an opponent's piece does nothing
- Selecting a valid destination applies the move
- Selecting an invalid destination reselects or deselects
- After a human move, if next turn is AI, `triggerAI` fires
- `isAIThinking` is true while the worker is running

---

## Phase 5 — Board UI

### ✅ S-17 · Render a static board
Create `BoardComponent.vue`. Render an 8×8 grid. Color
squares correctly (light/dark, using CSS variables). Number
the 32 dark squares with small text overlays for debugging.
No interactivity yet.

Acceptance:
- Board renders in `GameView`
- Dark squares are in the correct positions
- Square numbers 1–32 are visible and in the correct cells

### ✅ S-18 · Render pieces on the board
Create `PieceComponent.vue`. Read `gameStore.gameState
.board` and render each piece in its correct square. Pieces
are styled circles with a 3D-style radial gradient. Kings
display a crown symbol (♛).

Acceptance:
- Initial board shows 12 red pieces and 12 black pieces in
  the correct starting squares
- Kings are visually distinct from regular pieces

### ✅ S-19 · Implement square click interaction
Create `SquareComponent.vue`. Wire `BoardComponent` to
`gameStore.selectSquare(n)` on dark-square click. Highlight
the selected piece's square. Highlight valid move
destinations. Clicking a highlighted destination applies
the move.

Acceptance:
- Clicking a red piece on Red's turn highlights it and its
  valid destinations
- Clicking a highlighted destination moves the piece
- Clicking the selected piece again deselects it
- Clicking an invalid square does nothing
- After a move, highlights clear

### ✅ S-20 · Display captured piece counts
Create `GameStatusBar.vue`. Show current turn and captured
piece counts for each side. Read from `gameStore`.

Acceptance:
- Status bar updates after each move
- Captured count increments correctly after a jump

---

## Phase 6 — Additional UI Panels

### ✅ S-21 · Implement move history panel
Create `MoveHistoryPanel.vue`. Display a scrollable ordered
list of notation strings from `gameStore.gameState
.moveHistory`. Most recent entry is highlighted. Panel
auto-scrolls to the bottom when a new entry is added.
Panel height expands to fill the board column height.

Acceptance:
- Notation appears after each move
- Format matches `"11-15"` / `"11x18"` / `"11x18x27"`
- Panel scrolls to latest entry automatically
- Most recent entry is visually highlighted

### ✅ S-22 · Implement hint button
Create `HintButton.vue`. Visible only when it is a human
player's turn. On click, calls `gameStore.requestHint()`.
Highlighted hint squares appear on the board (distinct
color from valid-move highlights). Hints clear after the
player makes a move.

Acceptance:
- Hint button is hidden during AI turns and AI vs AI
- Clicking hint highlights one or more moves on the board
- Making a move clears the hints

### ✅ S-23 · Implement game-over modal
Create `GameOverModal.vue`. Shown when
`gameStore.gameState.status` is not `'playing'`. Displays
the winner or announces a draw. Provides [Play Again]
(calls `startGame()`) and [Main Menu] (calls `resetGame()`)
buttons.

Acceptance:
- Modal appears immediately when the game ends
- [Play Again] starts a new game with the same settings
- [Main Menu] navigates to `/`
- Draw result ("It's a draw!") is correctly displayed

---

## Phase 7 — Home Screen

### ✅ S-24 · Build the home/setup screen
`HomeView.vue`. Allows the player to configure:
- Play mode (Human vs Human, Human vs AI, AI vs AI)
- For Human vs AI: which side is human (Red or Black)
- AI difficulty per AI side
- Theme selection (live preview)

A [Start Game] button calls `settingsStore.setPlayers()`
and navigates to `/game`, where `gameStore.startGame()`
fires.

Acceptance:
- All configuration options visible and functional
- Selecting "Human vs Human" hides AI difficulty options
- Selecting "AI vs AI" shows two difficulty selectors
- [Start Game] navigates to the game and starts correctly

---

## Phase 8 — Keyboard Navigation & Accessibility

### ✅ S-25 · Implement roving tabindex on the board
In `BoardComponent`, maintain a `focusedSquare` ref. Only
the focused square has `tabindex="0"`; all others have
`tabindex="-1"`. Arrow keys update `focusedSquare` and call
`.focus()`. Focus wraps within the board grid.

Acceptance:
- Tab into the board focuses the last focused square (or
  square 1 on first focus)
- Arrow keys move focus across the board
- Focus does not escape the board via arrow keys

### ✅ S-26 · Wire keyboard actions to game interaction
In `SquareComponent` / `BoardComponent`:
- Enter or Space on a dark square calls
  `gameStore.selectSquare(n)`
- Escape cancels the current selection

Acceptance:
- A complete game can be played using only the keyboard
- Escape deselects the current piece

### ✅ S-27 · Add ARIA markup to the board
Apply `role="grid"`, `role="row"`, `role="gridcell"`. Add
reactive `aria-label` to each square using a
`squareLabel(n)` computed helper. Add `aria-selected` to
the selected square.

Acceptance:
- Screen reader announces square and piece info when focused
- Selected piece square is announced as selected
- Valid destination squares are announced as move targets

### ✅ S-28 · Implement ARIA live region for announcements
Add a visually hidden `aria-live="polite"` div to
`GameView`. Update its text after each move, capture,
kinging, and game-end event.

Acceptance:
- Screen reader announces move descriptions as they happen
- Announcements include captures and promotions
- Game-over and draw announcements fire when the game ends

---

## Phase 9 — Theming & Visual Polish

### ✅ S-29 · Implement CSS variable theming
Define `[data-theme="classic"]` and
`[data-theme="ocean"]` in `style.css`. `settingsStore
.setTheme()` sets `data-theme` on
`document.documentElement`.

Acceptance:
- Switching theme updates all board and piece colors
  instantly without a page reload
- Both themes look complete and intentional

### ✅ S-30 · Add piece movement animations
Animate piece movement using an absolutely-positioned
flying-piece overlay that transitions `left`/`top` at 250
ms per segment. For multi-jump sequences, animate each jump
leg sequentially (await each step). The real piece is
hidden during flight and revealed on landing.

Acceptance:
- Pieces slide smoothly to their destination
- Multi-jumps animate step by step, not all at once
- The flying piece shows pre-promotion state during flight

### ✅ S-31 · Add kinging animation
When a piece is promoted to king, the crown scales and
fades in with a brief bounce (keyframe animation, ~500 ms).

Acceptance:
- Kinging is visually distinct from a regular move
- Animation completes before the next turn begins

### ✅ S-32 · Add game-over animation
The `GameOverModal` fades in with a slight scale-up
transition rather than appearing instantly.

Acceptance:
- Modal entrance is smooth and non-jarring

### ✅ S-33 · Respect `prefers-reduced-motion`
Wrap all CSS transitions and `@keyframes` in a media query
so they are disabled for users who have requested reduced
motion.

Acceptance:
- With `prefers-reduced-motion: reduce` set in the OS,
  all transitions are instantaneous

### ✅ S-34 · Sound effects
Create `src/sound.ts`. Synthesize all sounds via the Web
Audio API using oscillators and gain envelopes — no audio
files required.

Sounds:
- **Move** — soft click (210 Hz triangle, 70 ms)
- **Capture** — descending thwack (380 → 110 Hz, 160 ms)
- **King** — three-note ascending chime (C5/E5/G5)
- **Win** — four-note fanfare (C5/E5/G5/C6)
- **Draw** — descending resolution (A4/G4/F4)

Play sounds from `BoardComponent`'s `lastMove` watcher
and `GameView`'s status watcher.

Acceptance:
- Move sound plays on every piece slide
- Capture sound plays on every jump
- King sound plays when a piece is promoted
- Win fanfare plays when a player wins
- Draw resolution plays on a draw

### ✅ S-35 · Multi-jump path numbers
When a selected piece has multi-jump options, number each
intermediate and final landing square (1, 2, 3…) on the
board so the path is visible before the player commits.
Intermediate squares are styled differently from final
destinations; clicking an intermediate square is a no-op.

Acceptance:
- Numbered badges appear on all landing squares in order
- Clicking an intermediate step square does not deselect
  the piece
- Numbers are removed when the piece is deselected or moves

### ✅ S-36 · Mandatory-jump indicators
When a jump is available and no piece is selected, display
a pulsing ring on every piece that must capture. Indicator
is suppressed during AI turns and after a piece is
selected.

Acceptance:
- Ring appears on all pieces with forced captures
- Ring disappears when any piece is selected
- Ring is absent during AI turns

---

## Phase 10 — Responsive Layout

### ✅ S-37 · Responsive two-column layout
Implement a CSS Grid two-column layout: board column
(`min(80vh, 1fr)`) on the left, side panel (200 px) on the
right. The side panel stretches to match the board column
height via `align-self: stretch`. Move history fills the
available side-panel height and scrolls within it.

Acceptance:
- All panels visible simultaneously on a wide viewport
- Board scales to fill available height without overflow
- Move history fills from below the status bar to the
  bottom of the board
- Side panel never extends beyond the board column height

### ✅ S-38 · Mobile layout
At `max-width: 640px`, switch to a stacked single-column
layout: status bar → board → hint button → move history.
Touch targets meet the 44 × 44 px minimum. `touch-action:
manipulation` eliminates the 300 ms tap delay.

Acceptance:
- No horizontal scroll on a 375 px wide viewport
- Board fills the available width
- Move history visible below the board

---

## Phase 11 — Testing & QA

### ✅ S-39 · Unit test coverage for the game engine
Ensure `board.ts`, `moves.ts`, `gameState.ts`, and
`notation.ts` each have thorough unit tests covering happy
paths, edge cases (corner squares, kings, multi-jumps, draw
detection, mid-jump kinging), and the mandatory jump rule.

### ✅ S-40 · Unit test coverage for AI modules
Test `random.ts`, `heuristic.ts`, `minimax.ts`, and
`evaluation.ts`. Confirm no illegal moves are ever
returned. Confirm Hard AI finds a forced win in 1 move.

### ✅ S-41 · Store unit tests
Test `gameStore.ts` and `settingsStore.ts`. Confirm
`startGame()`, `selectSquare()`, AI triggering, and
settings persistence all behave correctly.

### ⬜ S-42 · Component tests
Using Vue Test Utils + Vitest, test:
- `BoardComponent` renders correct number of squares
- `PieceComponent` renders correct `aria-label`
- `MoveHistoryPanel` appends and highlights correctly
- `GameOverModal` shows on correct status

### ⬜ S-43 · End-to-end: Human vs Human game
Playwright test (Chrome + Firefox): complete a full game
in Human vs Human mode using mouse clicks. Verify game-over
modal appears with the correct winner.

### ⬜ S-44 · End-to-end: keyboard-only game
Playwright test: complete several moves using only keyboard
input (Tab, arrow keys, Enter, Escape). Verify no focus
traps and no dead ends.

### ⬜ S-45 · End-to-end: AI vs AI game runs to completion
Playwright test: configure AI vs AI (any difficulty), click
Start, and wait for the game-over modal. Verify it appears
within a reasonable timeout (60 s).

---

## Phase 12 — Final Polish & Handoff

### ⬜ S-46 · Favicon and page title
Add a favicon (simple board or piece icon). Set the page
`<title>` to "Checkers". Update title dynamically during
gameplay (e.g. "Red's turn — Checkers").

### ⬜ S-47 · Error boundary and graceful degradation
If the AI worker throws or times out, display a
non-blocking error message and allow the user to reset the
game. No unhandled promise rejections in the console.

### ⬜ S-48 · Final accessibility audit
Run the game through an automated accessibility checker
(e.g. axe-core via Playwright). Resolve any critical or
serious violations. Manually verify keyboard-only play and
screen reader announcements.

### ⬜ S-49 · Cross-browser smoke test
Manually verify the complete game flow in the latest stable
Chrome and Firefox. Confirm animations, keyboard nav, and
AI all work correctly in both.
