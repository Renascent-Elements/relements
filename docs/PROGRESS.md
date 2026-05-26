# Implementation Progress

Tracks the 21-element pragmatic scope of Relements per `IMPLEMENTATION_PLAN.md`.

Legend: `[ ]` pending · `[~]` in progress · `[x]` complete (tests green, committed).

## Phase 1: CSS Foundation

- [x] `tokens.css`
- [x] `reset.css`
- [x] `base.css`
- [x] `index.css` (cascade layers wired)

## Phase 2: Native Form Elements

- [ ] button
- [ ] link
- [ ] input
- [ ] textarea
- [ ] select
- [ ] checkbox
- [ ] radio
- [ ] field
- [ ] field-group
- [ ] validation-message

## Phase 3: Native Interactive

- [ ] disclosure (`details` / `summary`)
- [ ] dialog
- [ ] progress
- [ ] meter

## Phase 4: JavaScript Enhancement API

- [ ] `enhanceDismissible`
- [ ] `enhanceDialog`

## Phase 5: Composite Behaviors

- [ ] tabs
- [ ] menu-button
- [ ] popover
- [ ] toast

*(accordion skipped — `details` covers the case)*

## Phase 6: Custom Elements

- [ ] `re-tabs`
- [ ] `re-toast`
- [ ] `re-menu`
- [ ] `re-popover`

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
