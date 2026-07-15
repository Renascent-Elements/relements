# @relements/core

## 1.15.0

### Minor Changes

- [#124](https://github.com/Renascent-Elements/relements/pull/124) [`cbdb10f`](https://github.com/Renascent-Elements/relements/commit/cbdb10f7961d9746548b8ceb272b41fd31b720c9) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add prose (`.re-prose`) — typographic flow for rendered content (markdown output, CMS bodies, articles). Restores the vertical rhythm reset.css zeroes and styles the flow-only elements base.css doesn't cover: blockquote (logical start border + byline `footer`/`cite`), figure/figcaption, lists, fluid media, bare tables, and bare `dl`. Line length caps at a readable `65ch` measure. All selectors are wrapped in `:where()` so prose adds zero specificity — components dropped inside the flow keep their own look. CSS-only.

## 1.14.0

### Minor Changes

- [#123](https://github.com/Renascent-Elements/relements/pull/123) [`d2a4460`](https://github.com/Renascent-Elements/relements/commit/d2a44608d233a6bb3a4faafedcbf64efedb19743) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add avatar presence dot (`.re-avatar__presence`) — a status dot pinned to the avatar's bottom-end corner. `data-presence` sets the state: `online`, `away`, `busy` (with a do-not-disturb bar), `offline` (hollow); no attribute renders a neutral "unknown" grey. The filled/hollow/bar shape split survives forced colors via system-color re-establishment, and the docs/tests enforce that the exact state reaches assistive tech as text (sr-only word in the dot for image avatars, status folded into the `aria-label` for `role="img"` initials avatars). CSS-only, extends `avatar.css`.

## 1.13.0

### Minor Changes

- [#121](https://github.com/Renascent-Elements/relements/pull/121) [`5443a34`](https://github.com/Renascent-Elements/relements/commit/5443a342077fdfb22aecfa8645b0f4363d5e53a3) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add choice card (`.re-choice`) — a selectable card built on a native, visible radio or checkbox. CSS-only: the card-level selection ring rides `:has(:checked)`, keyboard roving and form participation are native. `.re-choice-group` wraps a set in a `<fieldset>` (stacked by default, `data-orientation="horizontal"` for an equal-width row); `__title` and `__description` structure the card text. Checked state survives Windows High Contrast via a `Highlight` border, and the native control's glyph keeps the state visible to everyone regardless.

## 1.12.0

### Minor Changes

- [#115](https://github.com/Renascent-Elements/relements/pull/115) [`ef10e1a`](https://github.com/Renascent-Elements/relements/commit/ef10e1a58945f8dd779019087e0907ecddc05f8e) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add the `<re-tags-input>` custom element and a no-reparent **container mode** for `enhanceTagsInput` — the framework-safe ways to use the token editor.

  `enhanceTagsInput` on a bare `<input data-re-tags-input>` builds the chip editor by **moving** the input into a wrapper it creates. That's ideal for plain HTML, but a vdom framework (React/Vue/Svelte/Angular) that owns the input can throw `insertBefore … not a child` when it later mutates the input's slot. Two additive, non-breaking forms leave the input where it was rendered:
  - **`<re-tags-input>`** — the editor as a light-DOM custom element. It owns its subtree, so a framework treats it as opaque. Author an inner `<input>` (the no-JS fallback); reflected attributes (`name`, `value`, `placeholder`, `disabled`, `max`, `allow-duplicates`, `tone`, `tags-name`) apply to it. Exposes `.values` (read) and `.clear()`, and emits the bubbling `re-tags-change`. Give it an `aria-label` / `aria-labelledby` (it has no `<label>`) so the group is named.
  - **Container mode** — put `data-re-tags-input` on a **container** that holds the input; the behavior adopts that element as the `.re-tags-input` group and injects the chips as siblings, never moving the input.

  The existing `<input data-re-tags-input>` (input) mode is unchanged.

## 1.11.0

### Minor Changes

- [#111](https://github.com/Renascent-Elements/relements/pull/111) [`7e633d0`](https://github.com/Renascent-Elements/relements/commit/7e633d0c13c6b757d35e4b7a2d8c412b9796e4c0) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Accessibility hardening across the JavaScript behaviors — make dynamic status reach screen readers, fix focus drops, and tighten the keyboard model. axe was already clean; these close the semantics it can't see.
  - **multi-select** — a polite live region announces the "N selected" count (toggling boxes while the panel was open was silent), and a blocked required submit now mirrors `aria-invalid` + `aria-describedby` onto the focused summary with a `role="alert"` message (previously both sat on the collapsed `<fieldset>`, so the failure was unspoken). Dropped `aria-roledescription="multi-select"`, which suppressed the native collapsed/expanded state cue.
  - **command-palette** — an always-present `role="status"` line announces the result count as you filter ("3 results") and the empty state; the old empty region was toggled `hidden` then populated in the same tick, so it often didn't speak.
  - **carousel** — prev/next at the ends use `aria-disabled` instead of the native `disabled` property (which dropped keyboard focus to `<body>` and removed them from the a11y tree); pausing autoplay announces the settled slide; off-screen inerting **and** the settle announcement now work at any slide-per-view count.
  - **context-menu** — Space activates the focused item without polluting the typeahead buffer; a scroll/resize dismissal returns focus to the region instead of `<body>`.
  - **tags-input** — a rejected duplicate is announced (it was silent); a repeated identical message re-announces; the editor is `aria-describedby` its field hint; chips are exposed as a `role="list"`.

  No API changes — every fix is an attribute or live-region addition to the existing behaviors.

## 1.10.0

### Minor Changes

- [#106](https://github.com/Renascent-Elements/relements/pull/106) [`2da5f6c`](https://github.com/Renascent-Elements/relements/commit/2da5f6cce8b78b0d8bf479184ac899e61a9e69a2) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add the **toggle-group** component — a CSS-only, multi-select cluster of toggle
  buttons built on native checkboxes. `.re-toggle-group` (a `<fieldset>`) of
  `__option`s, each a `<input type="checkbox">` (own `name`/`value`) + a visible
  `<span>`; visually joined like a button-group, pressed = accent fill. The
  many-of-N sibling of the single-select `.re-segmented` (for stateless joined
  actions, use `.re-button-group`). Native pressed state + form submission (no
  JS), `aria-label`-named fieldset, `data-size="sm"` / `"lg"`, and a forced-colors
  `Highlight` fill so the on/off distinction never rides colour alone.

## 1.9.0

### Minor Changes

- [#104](https://github.com/Renascent-Elements/relements/pull/104) [`c075e9d`](https://github.com/Renascent-Elements/relements/commit/c075e9d37bc11022156cef582540b33226da7c2c) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add the **timeline** component — a CSS-only vertical, chronological event list.
  `.re-timeline` (a native `<ol>`) of `__item`s, each a decorative dot on a
  continuous connector rail with a `__title`, a `<time class="re-timeline__time"
datetime="…">`, and an optional `__description`. Mark the latest/active event
  with `data-current` (accent dot — pair with `aria-current`). `data-size="sm"`
  compact variant. Ordered-list semantics are kept (stripped in CSS, not
  `role="list"`); dots/rail are `aria-hidden`, so meaning rides the title + time.

## 1.8.0

### Minor Changes

- [#102](https://github.com/Renascent-Elements/relements/pull/102) [`68e80d8`](https://github.com/Renascent-Elements/relements/commit/68e80d8b92bb71f7bc0797f6d63047d301bb3c3a) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add the **stat** component — a CSS-only metric / KPI display. `.re-stat` shows a
  `__label`, a prominent `__value` (tabular figures), and an optional `__trend`
  (`data-trend="up|down|flat"` — direction carried by an arrow glyph + colour + an
  author-supplied `.re-sr-only` word, never colour alone) and `__description`.
  Compose a row with `.re-stat-group` (`data-divided` for separators).
  `data-size="sm"` and `data-align="center"` variants.

## 1.7.1

### Patch Changes

- [#97](https://github.com/Renascent-Elements/relements/pull/97) [`94d315b`](https://github.com/Renascent-Elements/relements/commit/94d315bad269931c178ca444790f9aea3bf1de11) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Carousel fixes:
  - **Autoplay no longer scrolls the page.** `enhanceCarousel`'s navigation centred the slide with `scrollIntoView()`, which scrolls _every_ ancestor — so an autoplaying carousel below the fold yanked the whole page down on each advance. It now scrolls only the track (centre offset computed from box geometry); native scroll-snap still drives touch/keyboard.
  - **Centre the Rung B chevrons.** The CSS-Carousel `::scroll-button()` prev/next glyphs used the single guillemets (`‹`/`›`), which render off-centre in the button; switched to the `❮`/`❯` chevron ornaments (U+276E/U+276F).

## 1.7.0

### Minor Changes

- [#88](https://github.com/Renascent-Elements/relements/pull/88) [`b414b9a`](https://github.com/Renascent-Elements/relements/commit/b414b9ae9eeafa8f78f6a52d3508f2d960baceab) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Carousel: add **autoplay** (opt-in via `data-re-carousel-autoplay`; optional ms value, default 5000). `enhanceCarousel` injects an auto-advance timer plus a **Pause/Play button** — the WCAG 2.2.2 (Pause, Stop, Hide) stop mechanism — and pauses while the carousel is hovered, while focus is inside it, and while the tab is hidden. Under `prefers-reduced-motion: reduce` it starts paused, and it suppresses the live-region announcement while playing.

  Autoplay runs on **either control rung** — the timer + pause button are JS even where the browser draws the dots/buttons itself (Rung B). The behavior's gate now skips only the _control injection_ on Rung B, not autoplay.

- [#88](https://github.com/Renascent-Elements/relements/pull/88) [`b414b9a`](https://github.com/Renascent-Elements/relements/commit/b414b9ae9eeafa8f78f6a52d3508f2d960baceab) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Carousel: add the zero-JS **CSS-Carousel** control rung (Rung B). Where the browser supports the CSS Carousel pseudo-elements (`scroll-marker-group`, `::scroll-marker`, `::scroll-button()` — Chrome 135+ today), `.re-carousel` now draws its dot strip and prev/next buttons with no JavaScript, styled to match the JS controls. `enhanceCarousel` feature-tests the same condition and stands down, so the two control sets never both appear (and a test asserts exactly one renders).

  Shipped behind `@supports` and labeled **experimental**: the UA-generated markers/buttons are ahead of assistive tech (documented tab-exposure bugs), so the JS controls (Rung C) remain the accessibility-tested path on engines without the feature. Autoplay is still deferred to a later release.

- [#88](https://github.com/Renascent-Elements/relements/pull/88) [`b414b9a`](https://github.com/Renascent-Elements/relements/commit/b414b9ae9eeafa8f78f6a52d3508f2d960baceab) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add **carousel** — a native CSS scroll-snap strip with the thinnest possible JS for controls.
  - **`.re-carousel`** (CSS only) — `.re-carousel__track` is `overflow-x: auto` + `scroll-snap-type: inline mandatory`; it scrolls and snaps with zero JS (touch, trackpad, scrollbar, and Arrow/Page/Home/End since the track is a focusable scroll region). New export `@relements/core/components/carousel.css`.
  - **`enhanceCarousel`** — back-fills the discoverable controls: prev/next buttons + a dot strip (plain buttons with `aria-label` / `aria-current`, **not** a tablist), active-slide tracking by box geometry (RTL-safe — no `scrollLeft`-sign math), end-disable (no wrap), `inert` on off-screen slides, and a debounced polite announcement of the settled slide. Navigation uses `scrollIntoView({ inline })` and honors `prefers-reduced-motion`. No custom event — derive the index from native `scroll`. New export `@relements/core/behaviors/carousel`.

  This is the first rung: the CSS-Carousel pseudo-element rung (`::scroll-button()` / `::scroll-marker`, zero-JS controls) lands later behind `@supports` as experimental; autoplay is deferred. Dynamic slides are out of scope for now — re-run `enhanceCarousel` after mutating the slide list. Forced colors: the active dot uses `Highlight` and the controls get a real `ButtonText` border.

## 1.6.0

### Minor Changes

- [#87](https://github.com/Renascent-Elements/relements/pull/87) [`65211be`](https://github.com/Renascent-Elements/relements/commit/65211be8b4a990396d35226cb766c77285cdc140) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add **multi-select** — multi-selection without a custom ARIA widget.
  - **`.re-multiselect`** (CSS only) — a native `<details>` / `<summary>` disclosure wrapping a `<fieldset>` of `.re-checkbox`es. One `name`, many values, real form submission, native keyboard; the summary mirrors `.re-select`, the panel is a plain absolute dropdown, and a closed `<details>` keeps its checkboxes out of the tab order natively. New export `@relements/core/components/multiselect.css`.
  - **`enhanceMultiSelect`** — writes the live "N selected" summary (labels up to a cap, then "+K more"; empty restores the authored placeholder), closes on Escape (returning focus to the summary) and outside-click, and — with `data-re-multiselect-required` — enforces ≥1 selection: blocks the form submit, sets `aria-invalid` on the `<fieldset>`, and reveals the `aria-describedby` validation message. Rides native `change` (no custom event). New export `@relements/core/behaviors/multiselect`.

  Built to the a11y conventions: the summary's accessible name is `label + value` (`aria-labelledby`) with `aria-roledescription="multi-select"`; the live value reaches assistive tech through the behavior (documented honestly — the no-JS control still submits but shows only the placeholder); checked boxes keep the `Highlight` fill from `.re-checkbox` under forced colors; the validation message lives outside `<details>` so it stays visible while the control is collapsed.

## 1.5.1

### Patch Changes

- [#86](https://github.com/Renascent-Elements/relements/pull/86) [`73365f7`](https://github.com/Renascent-Elements/relements/commit/73365f73fc79f18855fb26ca430ba56248d2501e) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Polish the native picker indicator on temporal `.re-input`s (`date`, `time`, `datetime-local`, `month`, `week`): a larger hit area, pointer cursor, and a hover wash on `::-webkit-calendar-picker-indicator`. Chromium-only (scoped with `@supports`; WebKit and Firefox keep their native indicator), excludes `.re-combobox`, adapts to dark via `color-scheme`, and drops the dim/wash under forced colors so the glyph keeps system contrast. No new API — the base `.re-input` already styles these fields on every engine.

## 1.5.0

### Minor Changes

- [#85](https://github.com/Renascent-Elements/relements/pull/85) [`7d94cd5`](https://github.com/Renascent-Elements/relements/commit/7d94cd5e1203eba073a9ffec164e3037d52d0f6e) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add three display components:
  - **`.re-progress-ring`** (CSS only) — a circular progress indicator with no native equivalent, drawn entirely in CSS: a `conic-gradient` sweep masked into a ring with the `%` label in the centre. `role="progressbar"` with `aria-valuenow`/`aria-valuetext`, `data-size` sm/md/lg, and a `data-indeterminate` spinner that respects `prefers-reduced-motion`. Under forced colors (where the gradient is dropped) the numeric label stays visible and a neutral `CanvasText` track ring is drawn, so the control still reads as a ring. New export `@relements/core/components/progress-ring.css`.
  - **`.re-avatar-group`** — an overlapping avatar stack with an optional `.re-avatar-group__count` overflow chip ("+3"). `role="group"` + an `aria-label` that owns the real total; each avatar's page-colour separation border becomes a real `CanvasText` outline under forced colors. Extends `avatar.css`.
  - **`.re-separator[data-label]`** — a labeled divider (a horizontal rule with centred text, e.g. "OR"). The lines are pseudo-elements with a real border (so they survive forced colors); the label rides the rendered text node and the host declares an explicit `aria-orientation`. `data-align` start/center/end. Extends `separator.css`.

## 1.4.0

### Minor Changes

- [#83](https://github.com/Renascent-Elements/relements/pull/83) [`b1ef811`](https://github.com/Renascent-Elements/relements/commit/b1ef811444dfa67abecf1ec21dd09747787c991a) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add the **file picker** — a custom-styled file selection control, the richer sibling of `.re-file`. A progressive-enhancement ladder:
  - **`.re-file-picker`** (CSS only) — a styled drop/browse area built by visually hiding the native `<input type="file">` (which stays the form value). Click-to-pick works with no JavaScript. `data-size` sm/md/lg, aria-invalid/disabled states. New export `@relements/core/components/file-picker.css`.
  - **`enhanceFilePicker`** — echoes the selected filenames (visible list + an sr-only `role="status"` announcement), wires drag-and-drop, a clear button, and `accept`/`data-re-file-max-files`/`data-re-file-max-size` validation. A rejected drop sets `aria-invalid` and emits `re-error` (`{ reason, rejected, accepted }`); value changes use the native `change` event. New export `@relements/core/behaviors/file-picker`.
  - **`<re-file-picker>`** — a thin custom-element wrapper: reflects `name`/`multiple`/`accept`/`disabled`/`required` onto the input, exposes `.files` (read/write) and `.clear()`, and runs the behavior on connect. New export `@relements/core/elements/re-file-picker`.

  Built to the project's a11y conventions: the picker is keyboard-operable via the native OS picker (drag-drop is a pointer-only enhancement), the focus ring shows on the visible UI via `:focus-within` (restored under forced colors), the clear button sits outside the `<label>` so it can't reopen the picker, and dark/forced-colors states stay distinguishable.

## 1.3.0

### Minor Changes

- [#81](https://github.com/Renascent-Elements/relements/pull/81) [`4285231`](https://github.com/Renascent-Elements/relements/commit/428523172b639acbfbbd466cf69aaa090bc63b4b) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add two native form inputs, completing native input coverage — both CSS-only (no JavaScript), styling the native control in place:
  - **`.re-file`** — `<input type="file">` with a restyled `::file-selector-button` (neutral filled button) and a framed field; the browser's filename text stays native. `data-size`: sm/md/lg, plus `aria-invalid` and `:disabled` states. New subpath export `@relements/core/components/file.css`.
  - **`.re-color`** — `<input type="color">` with a framed, rounded swatch sized from the control-height scale (vendor swatch chrome stripped). `data-size`: sm/md/lg. New subpath export `@relements/core/components/color.css`.

  Both stay distinct in dark mode (`bg-muted`, not `bg-subtle`) and keep a solid border so they read correctly under forced colors.

## 1.2.1

### Patch Changes

- [#78](https://github.com/Renascent-Elements/relements/pull/78) [`d441885`](https://github.com/Renascent-Elements/relements/commit/d441885e1d0afcddb5c3828701f01a52e63fcc7a) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Fix a dark-mode conformance regression across several components and add forced-colors support to progress/meter (found by a full-library conformance audit).

  `--re-color-bg-subtle` collapses to the surface colour in dark mode, so hover/raised states built on it became invisible against a card. Re-based those on `--re-color-bg-muted` (which stays distinct in both schemes), with the press state on button kept distinct via a `color-mix` step: **accordion, button (ghost/secondary), card footer, dialog & drawer (close + footer), disclosure, pagination, tabs**, and the **table** zebra stripe (now a faint text-wash that stays weaker than the row hover).

  `progress`/`meter` gained a `@media (forced-colors: active)` block so the fill level stays visible in Windows High Contrast (Highlight fill on a Canvas track) — previously the fill was conveyed by colour alone.

## 1.2.0

### Minor Changes

- [#74](https://github.com/Renascent-Elements/relements/pull/74) [`5140cf7`](https://github.com/Renascent-Elements/relements/commit/5140cf7b9ac6735e2985ab9a4ea3afd5581e9e5a) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Editor IntelliSense across editors. Ship VS Code HTML/CSS custom-data files (`@relements/core/html.custom-data.json`, `@relements/core/css.custom-data.json`) and a JetBrains `web-types.json` (auto-discovered via the `web-types` field) so the `<re-*>` tags, the `data-*` attributes (with their allowed values), the declarative `data-re-*` hooks, and every `--re-*` token autocomplete with hovers — in VS Code, LSP editors (Neovim/Helix/Zed/Sublime/Emacs), and JetBrains IDEs. A new [editor setup guide](https://renascent-elements.github.io/relements/guides/editor-setup/) documents the per-editor wiring and the per-framework TypeScript typings for the custom elements (React, Vue, Svelte, Angular).

## 1.1.1

### Patch Changes

- [#67](https://github.com/Renascent-Elements/relements/pull/67) [`2144195`](https://github.com/Renascent-Elements/relements/commit/21441951948195b41133280d38224533dfeec15f) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Enforce the CSS-authoring conventions with Stylelint, and fix the RTL bug it caught.
  - **Tooling:** a convention-only Stylelint config (`stylelint.config.mjs`, wired into `pnpm lint`) guards the house rules on component CSS — tokens-only colors, logical properties, and the browser floor (`lh`/`:dir()` are banned). Prettier still owns formatting.
  - **Fix:** `drawer` and `tooltip` used `:dir()` for their RTL transforms, which needs Safari 16.4 — above the documented Safari 15.4 floor — so their RTL silently degraded on older Safari. Converted to `[dir="rtl"]` (matching the rest of the library), which works on the full floor; specificity is preserved (each `:dir()`/`[dir]` contributes equally), so the drawer's dock-ordering is unchanged. Added an RTL test for the tooltip (the drawer already had one).
  - Plus a no-op logical-property cleanup (two horizontal-rule `border-top` → `border-block-start`).

## 1.1.0

### Minor Changes

- [#65](https://github.com/Renascent-Elements/relements/pull/65) [`268b869`](https://github.com/Renascent-Elements/relements/commit/268b86990d0f68e3687e350210a14cce3d765e37) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Keyboard-accessibility completeness + build hygiene.
  - **`enhanceMenuButton`** now supports first-character **typeahead** (multi-char buffer, like `enhanceContextMenu`) and treats **`aria-disabled`** items as inert to both keyboard navigation and clicks (previously they were focusable/activatable).
  - The **combobox** and **command-palette** listboxes now support **Home/End** to jump to the first/last option (Home/End still moves the text caret when the combobox listbox is closed).
  - **Deterministic builds:** the CSS build step now cleans `dist/` first, so removed components/behaviors no longer leave orphan chunks behind in a local `dist`.

## 1.0.0

### Major Changes

- [#63](https://github.com/Renascent-Elements/relements/pull/63) [`554224d`](https://github.com/Renascent-Elements/relements/commit/554224d70199f1eccee3fa7567ba731319534465) Thanks [@cstuncsik](https://github.com/cstuncsik)! - **Relements 1.0.0 — first stable release.** 🎉

  The API is now stable and versioned under semver. From here, the public surface — the `.re-*` classes, `data-*` attributes, `--re-*` tokens, the `enhance*(root) → { destroy() }` behavior contract, the `re-*` custom events, and the `<re-*>` custom elements — only changes in a backward-compatible way within 1.x; breaking changes wait for 2.0. See the [versioning policy](https://renascent-elements.github.io/relements/guides/versioning/).

  There are **no new breaking changes in 1.0.0** — upgrading from the latest `0.x` is a drop-in. This release marks the point where the surface is considered finished and stable, capping the pre-1.0 hardening:
  - **Breadth** — 44 components, 17 progressive-enhancement behaviors, and 4 light-DOM custom elements, every one HTML-first (works with zero JavaScript) and framework-agnostic.
  - **A normalized API** — semantic color is `data-tone` everywhere (structural variation stays `data-variant`); one canonical spelling per token; uniform `data-size` / `data-orientation` scales and `enhance*` signatures.
  - **Conformance** — automatic `prefers-color-scheme` dark mode, dark visual baselines on the token-risky components, and a Windows High Contrast / `forced-colors` policy (restored focus outlines + system-color state cues) — all regression-tested.
  - **Documentation** — a generated, drift-guarded [token reference](https://renascent-elements.github.io/relements/guides/tokens/); dark-mode, accessibility, theming, and behaviors guides; a `CONTRIBUTING` guide; and a keyboard/accessibility section on every component page.
  - **Quality** — behavior, axe-accessibility, and cross-platform visual-regression tests for every component on Chromium, Firefox, and WebKit, published via npm Trusted Publishing with provenance.

  Thank you for using Relements.

## 0.17.1

### Patch Changes

- [#60](https://github.com/Renascent-Elements/relements/pull/60) [`3abfeee`](https://github.com/Renascent-Elements/relements/commit/3abfeeee86fa0cb36b2d07c840ffb554c8030395) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Docs/DX for 1.0: reframe the package README's dark-mode section (the base import already follows `prefers-color-scheme` automatically; the Renascent theme is an optional brand palette on top) and note cross-component CSS dependencies in the granular-import example (context-menu→menu, command-palette/drawer→dialog). New documentation site guides — an authoritative token reference, dark mode, accessibility, and a behaviors/custom-elements overview — plus a CONTRIBUTING guide ship alongside (docs-site/repo only).

## 0.17.0

### Minor Changes

- [#58](https://github.com/Renascent-Elements/relements/pull/58) [`a2baf7c`](https://github.com/Renascent-Elements/relements/commit/a2baf7cd30c337d90a5c44daae94eb281be365e2) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Conformance hardening (2/2) — Windows High Contrast / forced-colors support.

  In forced-colors mode the browser strips `box-shadow` and flattens background/text to system colors, so the library's `box-shadow` focus rings disappeared and any state shown only by a background (selected/current/checked/pressed/active) became invisible to High-Contrast users.
  - **Global focus restore:** `base.css` now adds a real `outline: 2px solid Highlight` for `:focus-visible` under `@media (forced-colors: active)`, so every focusable element keeps a visible focus indicator (it overrides the components that opt into an inset `box-shadow` ring).
  - **State indicators** are re-established with system colors (`Highlight` / `HighlightText`) under forced-colors on: tabs (selected underline), segmented (checked pill), switch (checked track), tree (current leaf), pagination (current page), toolbar (pressed toggle), command-palette + combobox (active option), checkbox/radio (checked), and rating (filled stars + read-only display).

  No effect outside forced-colors mode (all rules are media-scoped), so normal light/dark rendering is unchanged. Validated with a Chromium forced-colors test suite.

## 0.16.0

### Minor Changes

- [#56](https://github.com/Renascent-Elements/relements/pull/56) [`f222381`](https://github.com/Renascent-Elements/relements/commit/f2223817f415f0e5c5f96c1f40347e4cf510759f) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Conformance hardening (1/2) — dark-mode coverage + a themeable modal scrim.
  - **New `--re-color-overlay` token** for the modal scrim. `dialog`/`drawer` `::backdrop` now reads it instead of a hardcoded `rgb(0 0 0 / 0.4)` literal, so the backdrop is themeable like everything else (value unchanged — purely additive).
  - **Dark-mode visual baselines** added for the components that consume the risky dark tokens (status tints, surfaces, selected/active states) and previously had light-only coverage: alert, badge, tag, toast, card, table, dialog, popover, combobox, tabs. This locks in the documented dark-token behavior (e.g. status-surface remaps, the `bg-muted` vs `bg-subtle` hover distinction) so a dark regression now fails CI instead of shipping silently. No API or runtime change.

## 0.15.0

### Minor Changes

- [#54](https://github.com/Renascent-Elements/relements/pull/54) [`de013ae`](https://github.com/Renascent-Elements/relements/commit/de013ae6646bc2139e4e98969addcc2dee05f681) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Pre-1.0 API & token normalization (settling public names before they freeze).

  **Breaking — semantic color is now `data-tone` everywhere.** The info/success/warning/danger/neutral palette is expressed with `data-tone` on every component that carries it. `alert`, `badge`, `banner`, and `tag` move from `data-variant` → `data-tone` (toast/popover/form already used `data-tone`). `data-variant` is now reserved for _structural_ variation (button primary/secondary/ghost/danger, link muted/subtle/external, tree `lines`, disclosure `plain`) and is unchanged on those.
  - Migration: `<div class="re-alert" data-variant="success">` → `data-tone="success"` (same for `re-badge`, `re-tag`, `re-banner`).
  - `enhanceTagsInput`: the `data-re-tags-variant` option is renamed `data-re-tags-tone` (it sets the chip's `.re-tag` tone).

  **Breaking — duplicate `danger` color tokens removed.** `--re-color-text-danger` and `--re-color-border-danger` (role-first) are dropped in favor of the semantic-first spelling that `success`/`warning`/`info` already use exclusively. Use `--re-color-danger-text` and `--re-color-danger-border` (identical values; the renascent theme already themes these). Anyone overriding the old names should rename them.

  **Non-breaking fixes:** the granular-import docs now lead with the required `tokens.css` (single-component imports were rendering unstyled); the npm tarball ships `dist` only (drops `src`, ~halving install size) and adds a `"./package.json"` export; the toast dismiss hover uses `--re-color-bg-muted` (was invisible in dark); and the tooltip (WCAG 1.4.13 is Hoverable + Persistent, not Dismissable) and tabs (automatic, not manual, activation) docs are corrected.

## 0.14.1

### Patch Changes

- [#52](https://github.com/Renascent-Elements/relements/pull/52) [`7049612`](https://github.com/Renascent-Elements/relements/commit/70496128ce0b1de74d16b2b6442969b60981d3d2) Thanks [@cstuncsik](https://github.com/cstuncsik)! - `enhanceCommandPalette`: the global hotkey now claims its combo. When the configured `data-re-command-hotkey` matches it also `stopPropagation()`s, so the keystroke doesn't bubble to a page-level `⌘K` search bound on `window`/`document` (e.g. a docs-site search) and open two things at once. The palette listens on `document`, which runs before any `window` listener in the bubble phase, so it reliably wins.

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
