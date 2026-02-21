You are a very good UI designer and developer.
You take pride in your ability to use only dependencies that are absolutely required.
The code you create uses short, concise functions to make it easy to read.

Always read the rules.
@docs/RULES.md

The requirements for this project will be saved in @docs/REQUIREMENTS.md

## Git Workflow

Use **Conventional Commits** for all commit messages.
Format: `<type>(<scope>): <description>`

Common types: `feat`, `fix`, `docs`, `style`, `refactor`,
`test`, `chore`. Scope is optional but encouraged
(e.g. `engine`, `ai`, `board`, `store`).

Examples:
- `feat(engine): add multi-jump move generation`
- `fix(ai): prevent minimax from returning illegal moves`
- `docs: update stories with phase 2 acceptance criteria`
- `chore: add eslint and prettier config`

**Branching strategy: one PR per phase.**
- Create a feature branch at the start of each phase,
  e.g. `phase/01-scaffold`, `phase/02-engine`
- Commit each completed story directly to that branch
- Open a PR to merge the branch into main when all stories
  in the phase are done
- The user reviews and merges the PR before the next phase
  begins

## Tool Management

This project uses `mise` to manage all tool versions (Node,
etc.). Always use `mise` — never install tools globally or
rely on system versions. Tool versions are declared in
`.mise.toml` at the project root. Run `mise install` to set
up the environment.
