# Implementation Progress

Tracks the 21-element pragmatic scope of Relements per `IMPLEMENTATION_PLAN.md`.

Legend: `[ ]` pending · `[~]` in progress · `[x]` complete (tests green, committed).

## Phase 1: CSS Foundation

- [x] `tokens.css`
- [x] `reset.css`
- [x] `base.css`
- [x] `index.css` (cascade layers wired)

## Phase 2: Native Form Elements

- [x] button
- [x] link
- [x] input
- [x] textarea
- [x] select
- [x] checkbox
- [x] radio
- [x] field
- [x] field-group
- [x] validation-message

## Phase 3: Native Interactive

- [x] disclosure (`details` / `summary`)
- [x] dialog
- [x] progress
- [x] meter

## Phase 4: JavaScript Enhancement API

- [x] `enhanceDismissible`
- [x] `enhanceDialog`

## Phase 5: Composite Behaviors

- [x] tabs
- [x] menu-button
- [x] popover
- [x] toast

_(accordion skipped — `details` covers the case)_

## Phase 6: Custom Elements

- [x] `re-tabs`
- [x] `re-toast`
- [x] `re-menu`
- [x] `re-popover`

## Acceptance per element

Each box is checked only when:

- HTML example at `docs/examples/<element>.html`
- CSS / JS / element file in `packages/core/src/{components,behaviors,elements}/`
- Playwright behavior test in `tests/elements/`
- axe a11y test in `tests/a11y/`
- Visual snapshot in `tests/visual/`
- `index.css` cascade-layered + `package.json` exports updated
- `pnpm test` green
- Atomic commit landed
