# @relements/core

## 0.14.0

### Minor Changes

- [#50](https://github.com/Renascent-Elements/relements/pull/50) [`1e122ac`](https://github.com/Renascent-Elements/relements/commit/1e122ac08308c5e6012502199c729ed598174d36) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add the **banner** component — a full-bleed, page-level announcement strip (cookie notice, maintenance window, promo, system status). A single horizontal row: leading icon + message + optional inline action + dismiss, spanning its container edge-to-edge with no rounded card border, optionally `data-sticky` pinned to the top. `data-variant="info|success|warning|danger"` tones; `data-emphasis="solid"` swaps the tint for a bold `*-700` fill + white text (AA-contrast verified); `data-align="center"` caps the message at a readable measure while the fill stays full-bleed. Dismiss reuses the existing `enhanceDismissible` behavior (`data-re-dismissible` / `data-re-dismiss`) — no new JavaScript. Distinct from `alert` (a rounded, inset, always-subtle inline card) on geometry + solid emphasis. (Docs note: `enhanceDismissible` hides for the session only; persist "don't show again" in the consumer.)

- [#50](https://github.com/Renascent-Elements/relements/pull/50) [`1e122ac`](https://github.com/Renascent-Elements/relements/commit/1e122ac08308c5e6012502199c729ed598174d36) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add the **steps** component — an ordered process indicator (stepper) built on a native `<ol class="re-steps">` of `<li data-status>` steps. Zero JavaScript: markers auto-number via a CSS counter, a complete step swaps its number for a pure-CSS check, and the connecting rail (which tints accent up to the last complete step) is drawn entirely in CSS. `data-orientation="vertical"` (default) / `horizontal`, `data-size="sm|md|lg"` (mirrors progress). Ordered-list semantics are kept (stripped visually in CSS, not via `role="list"`, so "N of M" survives); `aria-current="step"` marks the current `<li>`; markers are decorative. A completed step's content may be a real `<a href>`/`<button>`. Deliberately not an ARIA `role="tree"`/`tablist` widget — a display indicator, honest about its semantics.

- [#50](https://github.com/Renascent-Elements/relements/pull/50) [`1e122ac`](https://github.com/Renascent-Elements/relements/commit/1e122ac08308c5e6012502199c729ed598174d36) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add the **tree** component — a CSS-only nested-disclosure navigation tree built on native `<details>`/`<summary>` branches and `<a>`/`<button>` leaves. Zero JavaScript: expand/collapse, keyboard, focus order, and navigation are all native. Structural indentation (can't desync from the markup, RTL-correct), reused disclosure chevron, aligned leaf labels via a reserved gutter, `aria-current` selection, optional `data-variant="lines"` guide lines and `data-density="compact"`. Deliberately not an ARIA `role="tree"` widget (that keyboard model is out of scope), so it's honest about its semantics — every control is independently Tab-focusable.

## 0.13.0

### Minor Changes

- [#48](https://github.com/Renascent-Elements/relements/pull/48) [`307dab1`](https://github.com/Renascent-Elements/relements/commit/307dab10112a9ba397fa0be5309c56d25cdd773f) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add power-user Tier-2 components:
  - **range** — a two-thumb min–max slider built from two overlaid native range inputs (reuses `.re-slider`). Works with zero JS; `enhanceRange` prevents the thumbs from crossing (value-clamped, so each thumb maps to the full track and `aria-value*` stays honest), draws the fill, and routes track clicks. `data-size`, `data-re-range-gap`.
  - **context-menu** — a pointer-positioned right-click menu (also ContextMenu key / Shift+F10) reusing `.re-menu__panel`. Fixed-position above modals; light-dismiss + Escape + typeahead. `enhanceContextMenu` dispatches `re-select`; the native menu is the no-JS fallback.
  - **command-palette** — a ⌘K modal launcher composing the dialog + the combobox listbox model. `enhanceCommandPalette` adds the combobox/listbox ARIA on enhance (not in static markup), type-to-filter, arrow-key activedescendant navigation, an optional global hotkey, and dispatches `re-command`. No-JS baseline is a searchable dialog of real links.

## 0.12.0

### Minor Changes

- [#45](https://github.com/Renascent-Elements/relements/pull/45) [`a6b794b`](https://github.com/Renascent-Elements/relements/commit/a6b794b6944a83ee2a50d041060df7b16fa965fe) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add structural Tier-2 components:
  - **button-group** — CSS-only cluster that joins `.re-button`s into one control (collapsed seams, outer corners only; horizontal/vertical).
  - **empty-state** — CSS-only centered "no data / no results" placeholder (icon, title, description, actions; `data-size="sm"`, `data-bordered`, and a `.re-empty-state-cell` helper for table-empty cells).
  - **toolbar** — `.re-toolbar` band (`role="toolbar"`) plus the optional `enhanceToolbar` behavior for the ARIA roving-tabindex model (one Tab stop, Arrow/Home/End, RTL-aware, composes with a hosted `.re-menu`). Fully usable with zero JS.

## 0.11.0

### Minor Changes

- [#43](https://github.com/Renascent-Elements/relements/pull/43) [`781cdf0`](https://github.com/Renascent-Elements/relements/commit/781cdf017e46b43de0c9984cd57a3711b1d1c05c) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add the form-focused Tier-2 batch:
  - **Rating** (`.re-rating`) — a star rating on a native radio `<fieldset>`:
    keyboard, single-select, and form value with no JavaScript. The chosen star
    and all lower ones fill via floor-safe sibling selectors; `direction: rtl`
    aligns the visual order (1→5). `.re-rating-display` renders a read-only
    fractional average (`role="img"` + `--re-rating-value`). Optional
    `enhanceRating` normalizes arrow-key direction across browsers.
  - **OTP input** (`.re-otp` in `.re-otp-field`) — a single native one-time-code
    input styled segmented, so native paste, SMS autofill, and submission keep
    working. Optional `enhanceOtp` (`@relements/core/behaviors/otp`) adds an
    active-cell hook and opt-in digit filtering without splitting the field.
  - **`enhanceTagsInput`** (`@relements/core/behaviors/tags-input`) — turns a
    plain `.re-input` into a token editor: chips reuse `.re-tag`, Enter/comma
    commit, Backspace removes the last, with `data-re-tags-max` and
    case-insensitive de-duplication. Each tag is backed by a hidden input so the
    form submits an array; with no JavaScript it degrades to a comma-separated
    text field.

## 0.10.0

### Minor Changes

- [#40](https://github.com/Renascent-Elements/relements/pull/40) [`466049f`](https://github.com/Renascent-Elements/relements/commit/466049f1c39346e0f188f850f2961a8bf8e0bd46) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add the overlay + structure batch:
  - **Drawer** (`.re-drawer`) — an edge-anchored panel: a native modal `<dialog>`
    with `.re-drawer` added alongside `.re-dialog`, reusing `enhanceDialog`
    verbatim. `data-side="end|start|top|bottom"` (logical insets, RTL-aware),
    `data-size="sm|md|lg"`, and a `@starting-style` slide that degrades to instant.
  - **Alert dialog** — a dialog recipe: `role="alertdialog"` + `aria-labelledby`/
    `aria-describedby` + `autofocus` on the safe action. New
    `data-re-dialog-no-dismiss` hook (read by `enhanceDialog`) blocks Escape and
    backdrop dismissal for must-choose confirmations; explicit close buttons still
    work, and it warns if none is present.
  - **`enhanceAutosize`** (`@relements/core/behaviors/autosize`) — grows a
    `.re-textarea[data-autosize]` with its content. CSS `field-sizing: content`
    where supported; a `scrollHeight` fallback otherwise; a plain resizable
    textarea with no JS. Cap via `--re-autosize-max-block-size`.
  - **Description list** (`.re-description-list`) — read-only key/value pairs on a
    native `<dl>`. CSS-only; `data-layout="stacked|horizontal"`, plus
    `data-bordered`, `data-divided`, `data-density="compact"`, and a
    `--re-dl-term-width` knob.

## 0.9.0

### Minor Changes

- [#38](https://github.com/Renascent-Elements/relements/pull/38) [`b614818`](https://github.com/Renascent-Elements/relements/commit/b614818974c084122ce668eb2d4709812df5f81d) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add the form-input addon family:
  - **Input group** (`.re-input-group`) — a `:focus-within` wrapper that makes an
    input plus prefix/suffix affixes (`.re-input-group__text`), inline action
    buttons (`.re-input-group__action`), or an attached `.re-button` read as one
    control. CSS-only; shared foundation for the two behaviors below.
  - **Segmented control** (`.re-segmented`) — a single-select pill group built on
    native radio inputs, so arrow-key roving, single-selection, and form value are
    native. CSS-only.
  - **`enhancePasswordToggle`** (`@relements/core/behaviors/password-toggle`) — a
    show/hide button (`data-re-password-toggle`) that flips a password field's
    `type`, reflects `aria-pressed`, swaps its label, and preserves the caret.
  - **`enhanceNumberStepper`** (`@relements/core/behaviors/number-stepper`) —
    large ± buttons over a native `<input type="number">` (`data-re-number`) that
    call `stepUp()`/`stepDown()`, re-dispatch `input`/`change`, and disable at the
    min/max bound. The input stays the native spinbutton.

  All degrade to working native controls without JavaScript.

## 0.8.0

### Minor Changes

- [#35](https://github.com/Renascent-Elements/relements/pull/35) [`b8e444d`](https://github.com/Renascent-Elements/relements/commit/b8e444dd09593488b43a7cd20b34640b34be0b60) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add the `enhanceCombobox` behavior (`@relements/core/behaviors/combobox`):
  an opt-in (`data-re-combobox`) styled suggestion list over the native
  `<input list>` + `<datalist>` base. The list is never narrower than the
  input, reads the same `<datalist>` as its live data source, follows the
  ARIA editable-combobox pattern (filtering, Arrow/Enter/Escape,
  `aria-activedescendant`), and fires `input`/`change` on commit. Without
  JavaScript — or without the Popover API — the markup keeps the browser's
  native suggestion popup.

## 0.7.0

### Minor Changes

- [#33](https://github.com/Renascent-Elements/relements/pull/33) [`07f77c5`](https://github.com/Renascent-Elements/relements/commit/07f77c5e4018285a0d58b2cfd69686adb507a68e) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add three HTML-first components: **slider** (`.re-slider` on a native range
  input with `data-size` variants), **tooltip** (CSS-only `.re-tooltip` wrapper +
  `.re-tooltip__bubble` revealed on hover/focus, `data-placement="top|bottom|start|end"`,
  force-show via `data-open`), and **combobox** (`.re-combobox` additive to
  `.re-input` for `<input list>` + `<datalist>` suggestion inputs).

## 0.6.0

### Minor Changes

- [#30](https://github.com/Renascent-Elements/relements/pull/30) [`9298740`](https://github.com/Renascent-Elements/relements/commit/9298740fc7ebbe700590497248a23be47b03cada) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add separator, kbd, and code components. Pure-CSS enhancements over the native
  `<hr>`, `<kbd>`, and `<pre>`/`<figure>` base styles: a `.re-separator` with a
  vertical orientation for toolbars, a raised `.re-kbd` key cap, and a bordered
  `.re-code` block with an optional `<figcaption>` filename.

## 0.5.0

### Minor Changes

- [#27](https://github.com/Renascent-Elements/relements/pull/27) [`6dc222d`](https://github.com/Renascent-Elements/relements/commit/6dc222d7166451e41f6f9c34177475230906124f) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add four HTML-first, CSS-only components: `table` (with zebra/hover/density/sticky-header
  `data-*` options), `skeleton` (reduced-motion-safe shimmer), `spinner` (accessible busy
  indicator), and `pagination` (native links, `aria-current`/`aria-disabled`).

### Patch Changes

- [#28](https://github.com/Renascent-Elements/relements/pull/28) [`8e9893f`](https://github.com/Renascent-Elements/relements/commit/8e9893f61fb26fb5b9402001546f7bbb5aca84f2) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Align the scoped Renascent theme's `--re-color-accent-500` tint with the global
  dark ramp (`#60a5fa`). Previously `.theme-renascent` / `.theme-renascent-dark`
  used `#3c83f6` for the 500 step while the global `:root` dark used `#60a5fa`, so
  the accent tint differed depending on how the theme was applied. No change to
  button/link colors (600/700 unchanged).

## 0.4.1

### Patch Changes

- [#25](https://github.com/Renascent-Elements/relements/pull/25) [`749ca66`](https://github.com/Renascent-Elements/relements/commit/749ca66f54156a2eeffb3d05cc3503ec2785aa2b) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Fix WCAG AA contrast for primary buttons in the global dark Renascent theme.

  The dark theme's button base (`--re-color-accent-600`) was the brand `#3c83f6`,
  on which white button text is only ~3.6:1 (below AA). It now uses `#2563eb`
  (white 5.17:1), matching the light theme and the `.theme-renascent-dark` class —
  so dark primary/danger buttons are accessible regardless of how the theme is
  applied. `#3c83f6` remains the brand tint/gradient color.

## 0.4.0

### Minor Changes

- [#23](https://github.com/Renascent-Elements/relements/pull/23) [`b461310`](https://github.com/Renascent-Elements/relements/commit/b46131080c342774ee8f21bf2a549f224b4dec37) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Expose the Renascent theme's per-scheme palette as `--re-rn-light-*` /
  `--re-rn-dark-*` custom properties.

  `themes/renascent.css` now defines its light and dark brand palettes as
  always-available custom properties (backgrounds, text, borders, links,
  selection, focus, status surfaces, and the interactive accent steps), and
  references them internally. Consumers that drive theming with their own
  mechanism (e.g. a `data-theme` attribute) can map these vars to `--re-color-*`
  without duplicating the brand values. No visual change to the theme itself.

## 0.3.0

### Minor Changes

- [#21](https://github.com/Renascent-Elements/relements/pull/21) [`eecc90e`](https://github.com/Renascent-Elements/relements/commit/eecc90ea4cc1f1f481904396d07a68b6bbad429d) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add a light variant to the Renascent Elements theme.

  `themes/renascent.css` now follows `prefers-color-scheme`: brand dark on dark
  systems, brand light on light systems. The new `.theme-renascent-light` and
  `.theme-renascent-dark` classes force a scheme regardless of the OS.

  **Behavior change:** the theme was previously always dark. Add the
  `.theme-renascent-dark` class to a container (or `:root`) to keep forced-dark
  behavior.

  **Accessibility:** fixed WCAG AA contrast in the theme — buttons now use white
  text on accent/danger fills (was dark text), and status surfaces (alert tints)
  now render correctly in dark scope. These adjust the dark theme's button text
  and alert colors slightly.

## 0.2.0

### Minor Changes

- [#18](https://github.com/Renascent-Elements/relements/pull/18) [`a76a6f2`](https://github.com/Renascent-Elements/relements/commit/a76a6f263715d306d3cb6c6c231f9496cf4f42e5) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add eight components: **alert**, **badge**, **card**, **tag**, **avatar**, **breadcrumb**, **accordion**, and **switch**.

  All are pure CSS in the `re.components` cascade layer with per-component CSS exports (`@relements/core/components/<name>.css`). Alert and Tag reuse the existing `enhanceDismissible` behavior for dismissal; Accordion uses the native `<details name>` attribute for single-open exclusivity (no JavaScript), degrading to independent disclosures on older browsers; Switch is a styled `<input type="checkbox" role="switch">`.

  Also adds status-surface design tokens (`--re-color-{info,success,warning,danger}-surface/-border/-text`) with dark-scheme overrides.

## 0.1.3

### Patch Changes

- [#14](https://github.com/Renascent-Elements/relements/pull/14) [`567a5f0`](https://github.com/Renascent-Elements/relements/commit/567a5f0147ae1dd88c870523c2baedcf2c505e5a) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Fix custom-element registration and framework interop, and add framework usage examples.
  - Mark element modules as side-effectful so the documented `import "@relements/core/elements/re-tabs"` side-effect import is no longer tree-shaken away by bundlers (Vite/Rollup/webpack).
  - `<re-tabs>` now enhances light-DOM children that are projected after the host connects (e.g. Angular), and re-enhances idempotently if the host is moved/reconnected.
  - Add minimal usage examples for plain HTML, React, Vue, Svelte, and Angular under `docs/examples/frameworks/`, each consuming the published CSS/behavior/custom-element API with no framework wrappers.

## 0.1.2

### Patch Changes

- [#10](https://github.com/Renascent-Elements/relements/pull/10) [`8e1aa85`](https://github.com/Renascent-Elements/relements/commit/8e1aa8534c79bf2a9cd19ccabfabc85d68533fe2) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Set up CI (lint, unit, e2e) and Changesets-driven npm release with provenance.
