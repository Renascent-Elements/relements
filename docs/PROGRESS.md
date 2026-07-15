# Implementation Progress

Build-out history by the release that introduced each component / behavior / element.
The **live catalog** is the component tables in `packages/core/README.md`; per-release
detail is `packages/core/CHANGELOG.md`. The per-element definition of done is the
**Acceptance per element** checklist at the bottom.

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
- [x] `re-file-picker` (added later, with the file picker) — 1.4.0
- [x] `re-tags-input` (container-mode wrapper; the framework-safe token editor) — 1.12.0

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

## Component expansion (0.5.0)

CSS-only commons over native elements (PR #27).

- [x] table (`<table class="re-table">`; `data-zebra`/`data-hover`/`data-density`/`data-sticky-header`; `.re-table-wrap` scroll container)
- [x] pagination (`<nav>`/`<ol>` of native links; `aria-current="page"`, `aria-disabled` prev/next)
- [x] skeleton (`.re-skeleton` reduced-motion-safe shimmer; `data-shape`: text, circle)
- [x] spinner (`.re-spinner` accessible busy indicator; `data-size`: sm, md, lg)

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

## Tier-2 structural (0.12.0)

- [x] button-group (`.re-button-group`: CSS-only joined `.re-button` cluster, collapsed seams; `data-orientation`: vertical)
- [x] empty-state (`.re-empty-state`: centered no-data placeholder; `data-size="sm"`, `data-bordered`; `.re-empty-state-cell` for table cells)
- [x] toolbar (`.re-toolbar` `role="toolbar"` band + `enhanceToolbar` roving tabindex; `data-orientation`, `data-wrap`; RTL-aware)

## Tier-2 power-user (0.13.0)

- [x] range (two overlaid `<input type="range">`; `enhanceRange` non-crossing clamp + fill + track-click; reuses `.re-slider`; `data-re-range-gap`)
- [x] context-menu (`enhanceContextMenu`: pointer / Shift+F10 menu reusing `.re-menu__panel`; light-dismiss + typeahead; dispatches `re-select`)
- [x] command-palette (`.re-command-palette` ⌘K dialog + `enhanceCommandPalette` combobox/listbox ARIA, type-to-filter, activedescendant nav; dispatches `re-command`)

## Navigation + announcement (0.14.0)

- [x] banner (`.re-banner` full-bleed strip; `data-tone`, `data-emphasis="solid"`, `data-sticky`, `data-align="center"`; reuses `enhanceDismissible`)
- [x] steps (`<ol class="re-steps">` CSS-counter stepper; `data-status` per `<li>`, `data-orientation`, `data-size`; `aria-current="step"`, keeps ordered-list semantics, no `role="list"`)
- [x] tree (`.re-tree` native `<details>` nested-disclosure nav; `data-variant="lines"`, `data-density="compact"`; `aria-current`; not an ARIA `role="tree"` widget by design)

## 1.0.0 — first stable release

API frozen under semver (`.re-*` / `data-*` / `--re-*` / `enhance*(root) → { destroy() }` / `re-*` events / `<re-*>`). 44 components, 17 behaviors, 4 elements at the cut; `data-tone` normalization, dark-mode baselines, forced-colors policy, generated token reference. Drop-in from latest 0.x.

## Post-1.0 component additions (1.x)

- [x] file (`.re-file` native `<input type="file">`; restyled `::file-selector-button`; `data-size`) — 1.3.0
- [x] color (`.re-color` native `<input type="color">`; framed swatch; `data-size`) — 1.3.0
- [x] file-picker (`.re-file-picker` drop/browse area + `enhanceFilePicker` + `<re-file-picker>`; drag-drop, clear, accept/size/count validation; `re-error`) — 1.4.0
- [x] progress-ring (`.re-progress-ring` CSS conic+mask circular progress; `role="progressbar"`, `data-size`, `data-indeterminate`) — 1.5.0
- [x] avatar-group (`.re-avatar-group` overlapping stack + `__count` overflow chip; extends `avatar.css`) — 1.5.0
- [x] separator label (`.re-separator[data-label]` labeled divider, `data-align`; extends `separator.css`) — 1.5.0
- [x] multiselect (`.re-multiselect` native `<details>` of checkboxes + `enhanceMultiSelect`: "N selected" summary, Escape/outside-close, required validation) — 1.6.0
- [x] carousel (`.re-carousel` CSS scroll-snap + `enhanceCarousel` prev/next/dots/autoplay; zero-JS CSS-Carousel rung behind `@supports`, experimental) — 1.7.0
- [x] stat (`.re-stat` metric/KPI: `__label`/`__value`/`__trend`/`__description`; `.re-stat-group`; `data-size="sm"`, `data-align`) — 1.8.0
- [x] timeline (`<ol class="re-timeline">` dot-on-rail events; `__marker`/`__title`/`__time`/`__description`; `data-current`, `data-size="sm"`) — 1.9.0
- [x] toggle-group (`<fieldset class="re-toggle-group">` multi-select checkbox toggles; pressed = accent fill; `data-size`) — 1.10.0
- [x] choice card (`.re-choice` selectable radio/checkbox card via `:has(:checked)`; `__title`/`__description`; `.re-choice-group` fieldset, `data-orientation`) — 1.13.0

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
