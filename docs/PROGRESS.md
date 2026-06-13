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

## Form-input expansion (0.9.0)

The HTML-first form-control family — native bases, CSS-first, optional enhance.

- [x] input-group (`.re-input-group` wrapper: `:focus-within` ring + prefix/suffix `__text`, inline `__action` buttons, attached `.re-button`; shared foundation)
- [x] segmented (`<fieldset class="re-segmented">` of hidden radios + label pills; CSS-only, native roving/single-select)
- [x] password-toggle (`enhancePasswordToggle`: button flips `input.type`, `aria-pressed`/label swap, caret preserved)
- [x] number-stepper (`enhanceNumberStepper`: ± buttons call native `stepUp/stepDown`, re-dispatch `input`/`change`, disable at bounds)

## Overlay + structure expansion (0.10.0)

- [x] drawer (`.re-drawer` alongside `.re-dialog`, native modal `<dialog>` + `data-side` edge geometry + `@starting-style` slide; reuses `enhanceDialog`)
- [x] alert-dialog (dialog recipe: `role="alertdialog"` + `autofocus` safe action + `data-re-dialog-no-dismiss` cancel-guard in `enhanceDialog`)
- [x] autosize-textarea (`.re-textarea[data-autosize]` CSS `field-sizing` + `enhanceAutosize` scrollHeight fallback)
- [x] description-list (`.re-description-list` on `<dl>/<dt>/<dd>`; CSS-only; `data-layout` stacked/horizontal, `data-bordered`/`data-divided`/`data-density`)

## Form-input expansion II (0.11.0)

- [x] rating (`.re-rating` fieldset of hidden radios + star labels; CSS-only; `direction: rtl` aligns fill + arrow keys; `.re-rating-display` read-only fractional)
- [x] otp (single native `<input class="re-otp">` in `.re-otp-field`; segmented look, native paste/autofill; optional `enhanceOtp` active-cell + numeric strip)
- [x] tags-input (`enhanceTagsInput`: chips reuse `.re-tag`, hidden inputs submit an array, Enter/comma commit, max + dedupe; degrades to a comma-separated plain input)

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
