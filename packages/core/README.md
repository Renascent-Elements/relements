<p align="center">
  <img src="https://raw.githubusercontent.com/Renascent-Elements/relements/main/.github/assets/relements-logo.png" alt="Relements" width="120" height="120" />
</p>

# @relements/core

HTML-first, framework-agnostic design system by [Renascent Elements](https://renascentelements.hu). Semantic HTML + CSS tokens, with JavaScript only where native behavior falls short. The same class / attribute / event API works in React, Vue, Svelte, Angular, and plain HTML.

**Docs & live examples:** https://renascent-elements.github.io/relements/

[![npm version](https://img.shields.io/npm/v/@relements/core)](https://www.npmjs.com/package/@relements/core)
[![license](https://img.shields.io/npm/l/@relements/core)](https://github.com/Renascent-Elements/relements/blob/main/LICENSE)

## Install

```bash
npm install @relements/core
# or
pnpm add @relements/core
```

## Usage

### Plain HTML — no bundler, no JavaScript required

```html
<link rel="stylesheet" href="node_modules/@relements/core/dist/index.css" />

<button class="re-button" data-variant="primary">Save</button>

<label class="re-field">
  <span class="re-field__label">Email</span>
  <input class="re-input" type="email" name="email" />
  <span class="re-field__hint">We'll use this to contact you.</span>
</label>
```

### With a bundler (Vite, webpack, Rollup…)

```js
// Full bundle
import "@relements/core/index.css";

// Or import only what you use — tokens.css is REQUIRED first
// (every component reads --re-* custom properties from it)
import "@relements/core/tokens.css";
import "@relements/core/components/button.css";
import "@relements/core/components/form.css";

// Some component CSS builds on another component — import the base too:
//   context-menu  → also import components/menu.css
//   command-palette, drawer → also import components/dialog.css

// JS behaviors — tree-shakable ESM, fully typed
import { enhanceTabs } from "@relements/core/behaviors/tabs";
import { showToast } from "@relements/core/behaviors/toast";

// Custom elements
import "@relements/core/elements/re-tabs";
```

## Components

Every component is plain semantic HTML styled with `.re-*` classes and `data-*` attributes — no JavaScript needed for static use. Component CSS lives in the low-priority `re.components` cascade layer, so your own unlayered overrides win automatically, and you re-theme any subtree by redeclaring `--re-*` tokens on an ancestor.

### Forms & inputs

| Class                       | Element                    | Variants / options                                                           |
| --------------------------- | -------------------------- | ---------------------------------------------------------------------------- |
| `.re-input`                 | `<input>`                  | `data-size`: sm, md, lg; incl. date/time types (polished picker indicator)   |
| `.re-textarea`              | `<textarea>`               | `data-size`: sm, md, lg; auto-grow via `enhanceAutosize`                     |
| `.re-select`                | `<select>`                 | `data-size`: sm, md, lg                                                      |
| `.re-checkbox`              | `<input type="checkbox">`  | —                                                                            |
| `.re-radio`                 | `<input type="radio">`     | —                                                                            |
| `.re-switch`                | `<input type="checkbox">`  | `role="switch"`; `:checked`, `:disabled`                                     |
| `.re-field`                 | `<label>`                  | `__label` / `__hint`; `re-field--inline` for checkbox/radio rows             |
| `.re-field-group`           | `<fieldset>`               | `data-orientation`: horizontal                                               |
| `.re-validation-message`    | `<span>`                   | `data-tone`: success, hint, warning                                          |
| `.re-input-group`           | wrapper                    | prefix/suffix text + attached buttons; base for password & number inputs     |
| `.re-segmented`             | `<fieldset>` radios        | single-select pill group; `data-size`: sm, lg                                |
| `.re-slider`                | `<input type="range">`     | `data-size`: sm, md, lg                                                      |
| `.re-combobox`              | `<input>` + `<datalist>`   | native autocomplete; styled listbox via `enhanceCombobox`                    |
| `.re-otp` / `.re-otp-field` | single `<input>`           | segmented one-time-code; `--re-otp-length`; `data-size`: sm, lg              |
| `.re-rating`                | `<fieldset>` radios        | star rating; `.re-rating-display` (read-only, fractional); sizes sm/lg       |
| `.re-tags-input`            | wrapper                    | chip/token editor via `enhanceTagsInput`; `data-size`: sm, lg                |
| `.re-range`                 | two `<input type="range">` | two-thumb min–max slider via `enhanceRange`; `data-size`: sm, lg             |
| `.re-file`                  | `<input type="file">`      | styled `::file-selector-button`, native filename; `data-size`: sm, md, lg    |
| `.re-color`                 | `<input type="color">`     | framed native swatch; `data-size`: sm, md, lg                                |
| `.re-file-picker`           | wrapper + `<input file>`   | custom drop/browse area; filenames, drag-drop, clear via `enhanceFilePicker` |

### Actions

| Class              | Element                         | Variants / options                                                                        |
| ------------------ | ------------------------------- | ----------------------------------------------------------------------------------------- |
| `.re-button`       | `<button>`, `<a>`, submit input | `data-variant`: primary, secondary, ghost, danger; `data-size`: sm, md, lg                |
| `.re-link`         | `<a>`                           | `data-variant`: muted, subtle, external                                                   |
| `.re-button-group` | wrapper                         | joins `.re-button`s into one control; `data-orientation`: vertical                        |
| `.re-toolbar`      | `[role="toolbar"]`              | band of controls + arrow-key roving via `enhanceToolbar`; `data-orientation`, `data-wrap` |

### Feedback & status

| Class               | Element            | Variants / options                                                                                                                                                              |
| ------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.re-alert`         | `<div>` + `role`   | `data-tone`: info, success, warning, danger; dismissible                                                                                                                        |
| `.re-banner`        | `<aside>` + `role` | full-bleed announcement strip; `data-tone`: info, success, warning, danger; `data-emphasis="solid"`; `data-sticky`; `data-align="center"`; dismissible via `enhanceDismissible` |
| `.re-badge`         | `<span>`           | `data-tone`: neutral, info, success, warning, danger                                                                                                                            |
| `.re-tag`           | `<span>`           | `data-tone`: neutral, info, success, warning, danger; removable                                                                                                                 |
| `.re-progress`      | `<progress>`       | `data-size`: sm, md, lg                                                                                                                                                         |
| `.re-progress-ring` | `<div>` + `role`   | circular progress, CSS-only (conic + mask); `data-size`: sm, md, lg; `data-indeterminate`                                                                                       |
| `.re-meter`         | `<meter>`          | `data-size`: sm, md, lg                                                                                                                                                         |
| `.re-spinner`       | `<span>`           | `data-size`: sm, md, lg                                                                                                                                                         |
| `.re-skeleton`      | `<span>`           | `data-shape`: text, circle                                                                                                                                                      |
| `.re-toast-region`  | live region host   | pairs with `showToast`                                                                                                                                                          |

### Overlays

| Class                     | Element             | Variants / options                                                                              |
| ------------------------- | ------------------- | ----------------------------------------------------------------------------------------------- |
| `.re-dialog`              | `<dialog>`          | `showModal()` surface (header/body/footer); alert-dialog recipe via `data-re-dialog-no-dismiss` |
| `.re-drawer`              | `<dialog>`          | edge sheet; `data-side`: start, end, top, bottom; `data-size`: sm, lg                           |
| `.re-popover`             | `[popover]` element | `data-tone`: info, warning, danger                                                              |
| `.re-tooltip`             | `<span>`            | `data-placement`: top, bottom, start, end                                                       |
| `.re-menu`                | container           | pairs with `[role="menu"]`, `[role="menuitem"]`                                                 |
| `.re-context-menu__panel` | `[role="menu"]`     | right-click / keyboard menu at the pointer via `enhanceContextMenu` (reuses `.re-menu__panel`)  |
| `.re-command-palette`     | `<dialog>`          | ⌘K modal launcher via `enhanceCommandPalette` (additive to `.re-dialog`)                        |

### Navigation

| Class            | Element                      | Variants / options                                                                                                           |
| ---------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `.re-tabs`       | container                    | pairs with `[role="tablist"]`, `[role="tab"]`, `[role="tabpanel"]`                                                           |
| `.re-breadcrumb` | `<nav>` / `<ol>`             | `aria-current="page"` on current                                                                                             |
| `.re-pagination` | `<nav>` / `<ol>`             | page links with prev / next                                                                                                  |
| `.re-steps`      | `<ol>`                       | ordered stepper; `data-status` per step (complete/current/upcoming); `data-orientation`: horizontal; `data-size`: sm, md, lg |
| `.re-accordion`  | `<details name>` group       | native single-open; wraps `.re-disclosure`                                                                                   |
| `.re-disclosure` | `<details>`                  | `data-variant`: plain                                                                                                        |
| `.re-tree`       | `<nav>` + nested `<details>` | CSS-only disclosure tree; `data-variant="lines"`; `data-density="compact"`                                                   |

### Content & layout

| Class                  | Element            | Variants / options                                                                                        |
| ---------------------- | ------------------ | --------------------------------------------------------------------------------------------------------- |
| `.re-card`             | `<article>`        | `__header` / `__body` / `__footer`; `data-interactive`                                                    |
| `.re-avatar`           | `<span>`           | `data-size`: sm, md, lg; `<img>` or initials                                                              |
| `.re-avatar-group`     | `<div>` + `role`   | overlapping avatar stack; `.re-avatar-group__count` overflow chip ("+3")                                  |
| `.re-table`            | `<table>`          | `data-zebra`, `data-hover`, `data-density="compact"`, `data-sticky-header`; `.re-table-wrap` for scroll   |
| `.re-description-list` | `<dl>`             | `data-layout="horizontal"`, `data-divided`, `data-bordered`, `data-density="compact"`                     |
| `.re-separator`        | `<hr>` / `[role]`  | `data-orientation`: vertical; `data-label` labeled divider (`data-align`: start, center, end)             |
| `.re-kbd`              | `<kbd>`            | keyboard key                                                                                              |
| `.re-code`             | `<code>` / `<pre>` | inline + block code                                                                                       |
| `.re-empty-state`      | `<div>`            | centered "no data" placeholder; `data-size="sm"`, `data-bordered`; `.re-empty-state-cell` for table cells |

## JavaScript behaviors

Each behavior accepts a root (`Document`, `Element`, or `ShadowRoot`), wires up the pattern, and returns `{ destroy() }`.

```js
import { enhanceTabs } from "@relements/core/behaviors/tabs";

const controller = enhanceTabs(document);
// later:
controller.destroy();
```

| Behavior                | What it does                                                                  | Key event        |
| ----------------------- | ----------------------------------------------------------------------------- | ---------------- |
| `enhanceTabs`           | Arrow keys, Home/End, roving tabindex                                         | `re-change`      |
| `enhanceMenuButton`     | Keyboard nav, outside-click close                                             | `re-select`      |
| `enhanceDialog`         | Trigger binding, close buttons, backdrop dismiss, alert-dialog cancel-guard   | —                |
| `enhancePopover`        | Anchored positioning, toggle event bridge                                     | `re-toggle`      |
| `enhanceDismissible`    | Dismiss buttons via `[data-re-dismiss]`                                       | `re-dismiss`     |
| `enhanceCombobox`       | Styled listbox over a native `<datalist>` (ARIA editable combobox)            | `change`         |
| `enhanceAutosize`       | `<textarea>` grows to its content (`field-sizing` + fallback)                 | —                |
| `enhancePasswordToggle` | Show/hide password button (`aria-pressed`)                                    | —                |
| `enhanceNumberStepper`  | +/− stepper buttons for `<input type="number">`                               | `input`/`change` |
| `enhanceOtp`            | Optional OTP polish: active-cell hook + opt-in digit strip                    | —                |
| `enhanceTagsInput`      | Chip/token editor backed by hidden inputs (submits an array)                  | `re-tags-change` |
| `enhanceRating`         | Cross-engine arrow-key normalization for the star rating                      | `input`/`change` |
| `enhanceToolbar`        | Toolbar roving tabindex (one Tab stop, Arrow/Home/End, RTL-aware)             | —                |
| `enhanceRange`          | Two-thumb range: non-crossing clamp + fill + track-click routing              | `input`/`change` |
| `enhanceContextMenu`    | Right-click / Shift+F10 menu at the pointer (reuses the menu keyboard model)  | `re-select`      |
| `enhanceCommandPalette` | ⌘K palette: combobox/listbox ARIA, type-to-filter, activedescendant nav       | `re-command`     |
| `enhanceFilePicker`     | File picker: filename readout, drag-drop, clear, accept/size/count validation | `re-error`       |
| `showToast(msg, opts)`  | `aria-live` toast notifications                                               | —                |

## Custom elements

Light-DOM only (no Shadow DOM). Same HTML/CSS contract as the plain class API.

```html
<script type="module" src="node_modules/@relements/core/dist/elements/re-tabs.js"></script>

<re-tabs>
  <div role="tablist" aria-label="Account">
    <button role="tab" id="t1" aria-controls="p1" aria-selected="true">Profile</button>
    <button role="tab" id="t2" aria-controls="p2" aria-selected="false" tabindex="-1">
      Settings
    </button>
  </div>
  <section role="tabpanel" id="p1" aria-labelledby="t1">…</section>
  <section role="tabpanel" id="p2" aria-labelledby="t2" hidden>…</section>
</re-tabs>
```

| Tag                | Wraps               | Exposes                             |
| ------------------ | ------------------- | ----------------------------------- |
| `<re-tabs>`        | `enhanceTabs`       | `.value` (selected tab id)          |
| `<re-toast>`       | `showToast`         | `.show(message, options)`           |
| `<re-menu>`        | `enhanceMenuButton` | `.open` boolean                     |
| `<re-popover>`     | `enhancePopover`    | `.show()` / `.hide()` / `.toggle()` |
| `<re-file-picker>` | `enhanceFilePicker` | `.files` (read/write) / `.clear()`  |

## Editor support

IntelliSense (autocomplete + hovers for the `<re-*>` tags, the `data-*` attributes, the `data-re-*` hooks, and every `--re-*` token) ships in two formats:

- **VS Code** / LSP editors (Neovim, Helix, Zed, Sublime, Emacs) — [VS Code custom-data](https://code.visualstudio.com/api/extension-guides/custom-data-extension). In `.vscode/settings.json`:

  ```json
  {
    "html.customData": ["./node_modules/@relements/core/html.custom-data.json"],
    "css.customData": ["./node_modules/@relements/core/css.custom-data.json"]
  }
  ```

- **JetBrains** (WebStorm, IntelliJ) — a [web-types](https://github.com/JetBrains/web-types) file, auto-discovered from `node_modules` with no configuration.

Each element also ships a typed class (`ReTabsElement`, …) for TypeScript. See the [editor setup guide](https://renascent-elements.github.io/relements/guides/editor-setup/) for the per-editor wiring and the per-framework `<re-*>` template typings.

## Theming

All values are `--re-*` CSS custom properties. Override globally or on any subtree.

```css
:root {
  --re-color-accent-600: #7c3aed; /* swap the brand colour */
}

.my-card {
  --re-color-surface: #1e293b; /* dark card, light page */
}
```

### Dark mode & the Renascent theme

Dark mode is automatic: the base `index.css` already follows `prefers-color-scheme`, so importing it gives light + dark with zero config. The **Renascent** theme below is an _optional_ brand palette (dark navy, electric blue, phoenix orange) layered on top — not a prerequisite for dark mode.

```html
<link rel="stylesheet" href="node_modules/@relements/core/dist/index.css" />
<link rel="stylesheet" href="node_modules/@relements/core/dist/themes/renascent.css" />
```

Or scope it to a subtree:

```html
<div class="theme-renascent">…</div>
```

The Renascent theme is the dark navy palette from [renascentelements.hu](https://renascentelements.hu), with electric blue primary, purple accent, and phoenix orange.

## Key tokens

| Token                   | Light default      | Purpose                                |
| ----------------------- | ------------------ | -------------------------------------- |
| `--re-color-accent-600` | `#2563eb`          | Buttons, links, focus ring             |
| `--re-color-bg`         | `#ffffff`          | Page background                        |
| `--re-color-surface`    | `#ffffff`          | Card / panel background                |
| `--re-color-text`       | `#0f172a`          | Body text                              |
| `--re-color-border`     | `#e2e8f0`          | Borders                                |
| `--re-color-focus-ring` | `#3b82f6`          | Keyboard focus indicator               |
| `--re-color-overlay`    | `rgb(0 0 0 / 0.4)` | Modal scrim (dialog / drawer backdrop) |
| `--re-space-4`          | `1rem`             | Base spacing (4 px scale)              |
| `--re-radius-md`        | `0.375rem`         | Default radius                         |

Full list in [`src/tokens.css`](./src/tokens.css).

## License

MIT — [Renascent Elements](https://renascentelements.hu)
