# Checkers

A polished, modern American Checkers game built with Vue 3
and TypeScript, playable in the browser on desktop and
mobile.

---

## Features

- **Three play modes** — Human vs Human, Human vs AI,
  AI vs AI
- **Three AI difficulty levels**
  - Easy — random move selection
  - Medium — greedy heuristic (one-ply evaluation)
  - Hard — minimax with alpha-beta pruning (depth 8)
- **Full American Checkers rules** — mandatory jumps,
  multi-jump sequences, kinging, 40-move draw rule
- **Move history** — scrollable log with standard algebraic
  notation (`11-15`, `11x18x25`)
- **Hint system** — highlights a suggested move on demand
  (Medium AI quality)
- **Two themes** — Classic (red/brown board) and Ocean
  (blue/white board); persisted across sessions
- **Animations** — smooth piece movement, per-segment
  multi-jump animation, crown bounce on kinging, modal
  entrance
- **Sound effects** — Web Audio API synthesis for moves,
  captures, kinging, wins, and draws
- **Mandatory-jump indicators** — pulsing ring highlights
  pieces that must capture on the current turn
- **Multi-jump path guides** — landing squares numbered
  in order so the path is always clear
- **Full keyboard navigation** — arrow keys, Enter/Space,
  Escape; roving tabindex pattern
- **Screen reader support** — ARIA grid roles, dynamic
  labels, live region announcements
- **Responsive layout** — adapts from wide desktop down to
  375 px mobile viewports

---

## Tech stack

| Concern         | Choice                              |
|-----------------|-------------------------------------|
| Framework       | Vue 3 (Composition API, `<script setup>`) |
| Language        | TypeScript (strict mode)            |
| Build tooling   | Vite                                |
| State           | Pinia                               |
| Routing         | Vue Router                          |
| Testing         | Vitest + @vue/test-utils, Playwright|
| Styling         | Scoped CSS with CSS custom properties|
| Tool management | mise                                |

---

## Getting started

Requires [mise](https://mise.jdx.dev/) for tool management.

```bash
# Install Node (version specified in .mise.toml)
mise install

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Commands

| Command              | Description                          |
|----------------------|--------------------------------------|
| `npm run dev`        | Start dev server with HMR            |
| `npm run build`      | Type-check and build for production  |
| `npm run preview`    | Preview the production build locally |
| `npm test`           | Run unit tests once                  |
| `npm run test:watch` | Run unit tests in watch mode         |
| `npm run lint`       | Lint with ESLint                     |
| `npm run format`     | Format with Prettier                 |

---

## Project structure

```
src/
├── engine/          # Pure game logic (no Vue)
│   ├── board.ts     # Board representation and move application
│   ├── moves.ts     # Move generation (simple, jump, multi-jump)
│   ├── gameState.ts # State transitions and draw/win detection
│   └── notation.ts  # Algebraic notation formatting
├── ai/
│   ├── random.ts    # Easy: uniform random selection
│   ├── heuristic.ts # Medium: greedy one-ply evaluation
│   ├── minimax.ts   # Hard: minimax + alpha-beta (depth 8)
│   ├── evaluation.ts# Board scoring function
│   ├── worker.ts    # Web Worker wrapper
│   └── index.ts     # Difficulty dispatcher
├── stores/
│   ├── gameStore.ts    # Game state, UI state, AI orchestration
│   └── settingsStore.ts# Theme, player types, difficulty (persisted)
├── views/
│   ├── HomeView.vue    # Setup / configuration screen
│   └── GameView.vue    # Main game screen
├── components/
│   ├── board/
│   │   ├── BoardComponent.vue  # 8×8 grid, highlights, animations
│   │   ├── SquareComponent.vue # Individual square with visual states
│   │   └── PieceComponent.vue  # 3D-style piece with crown
│   └── panels/
│       ├── GameStatusBar.vue   # Turn indicator and capture counts
│       ├── MoveHistoryPanel.vue# Scrollable move log
│       ├── HintButton.vue      # Hint request button
│       └── GameOverModal.vue   # Win/draw dialog
├── sound.ts         # Web Audio API sound synthesis
├── style.css        # Global reset and theme variables
└── types/index.ts   # Shared TypeScript types
```

---

## Rules

Standard American / English Checkers:

- Black moves first
- Pieces move diagonally forward one square
- Jumps are mandatory; multi-jumps must be completed
- A piece reaching the back rank becomes a King and may
  move or jump in any diagonal direction
- A piece that is kinged mid-jump sequence ends its turn
  immediately (no further jumps as a King in the same turn)
- The game is a draw after 40 consecutive half-moves
  without a capture
