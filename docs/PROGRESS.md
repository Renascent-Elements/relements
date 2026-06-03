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

## Phase 6: Custom Elements

- [x] `re-tabs`
- [x] `re-toast`
- [x] `re-menu`
- [x] `re-popover`

## Component expansion (0.2.0)

High-value commons, pure CSS in the `re.components` layer. Visual snapshot
baselines are generated on CI (Linux); marked `[x]` once `pnpm test` is green
and the work is committed.

- [~] alert (reuses `enhanceDismissible`)
- [~] badge
- [~] card
- [~] tag (removable via `enhanceDismissible`)
- [~] avatar
- [~] breadcrumb
- [~] accordion — grouped exclusive `<details name>` (adds single-open over the existing disclosure)
- [~] switch (`<input type="checkbox" role="switch">`)

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
