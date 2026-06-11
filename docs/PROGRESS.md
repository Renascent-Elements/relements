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

- [x] alert (reuses `enhanceDismissible`)
- [x] badge
- [x] card
- [x] tag (removable via `enhanceDismissible`)
- [x] avatar
- [x] breadcrumb
- [x] accordion — grouped exclusive `<details name>` (adds single-open over the existing disclosure)
- [x] switch (`<input type="checkbox" role="switch">`)

## Component expansion (0.6.0)

Pure-CSS enhancements over native elements already styled in `re.base`.

- [x] separator (`<hr class="re-separator">` + vertical `data-orientation`)
- [x] kbd (`<kbd class="re-kbd">` key cap)
- [x] code (`<figure class="re-code">` block + `<figcaption>` filename)

## Component expansion (0.7.0)

- [x] slider (`<input type="range" class="re-slider">`, sizes via `data-size`)
- [x] tooltip (`.re-tooltip` wrapper + `.re-tooltip__bubble`, hover/focus reveal, `data-placement`)
- [x] combobox (`<input class="re-input re-combobox" list>` + `<datalist>`)

## Behavior expansion (0.8.0)

- [x] enhanceCombobox (`data-re-combobox` opt-in: styled listbox ≥ input width over the same `<datalist>`; native popup suppressed; ARIA editable-combobox keyboard pattern)

## Acceptance per element

Each box is checked only when:

- HTML example at `docs/examples/<element>.html`, with `<!-- demo:start name="X" -->`
  … `<!-- demo:end -->` delimiters around each demo region
- CSS / JS / element file in `packages/core/src/{components,behaviors,elements}/`
- Playwright behavior test in `tests/elements/`
- axe a11y test in `tests/a11y/`
- Visual snapshot in `tests/visual/` (both `-darwin` and `-linux` baselines committed)
- `index.css` cascade-layered + `package.json` exports updated
- Docs page at `docs/public/src/content/docs/components/<element>.mdx` using `<Demo />`
- Changeset added (`pnpm changeset`)
- `pnpm test` green
- Atomic commit landed
