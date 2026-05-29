# @relements/core

HTML-first design system by [Renascent Elements](https://renascentelements.hu). Semantic HTML + CSS tokens. JavaScript only where native behavior falls short.

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

// Or import only what you use
import "@relements/core/components/button.css";
import "@relements/core/components/form.css";

// JS behaviors — tree-shakable ESM, fully typed
import { enhanceTabs } from "@relements/core/behaviors/tabs";
import { showToast } from "@relements/core/behaviors/toast";

// Custom elements
import "@relements/core/elements/re-tabs";
```

## Components

All styled with CSS classes and `data-*` attributes. No JavaScript needed for static use.

| Class                    | Element                         | Variants / options                                                 |
| ------------------------ | ------------------------------- | ------------------------------------------------------------------ |
| `.re-button`             | `<button>`, `<a>`, submit input | `data-variant`: primary, secondary, ghost, danger                  |
| `.re-link`               | `<a>`                           | `data-variant`: muted, subtle, external                            |
| `.re-input`              | `<input>`                       | `data-size`: sm, md, lg                                            |
| `.re-textarea`           | `<textarea>`                    | `data-size`: sm, md, lg                                            |
| `.re-select`             | `<select>`                      | `data-size`: sm, md, lg                                            |
| `.re-checkbox`           | `<input type="checkbox">`       | —                                                                  |
| `.re-radio`              | `<input type="radio">`          | —                                                                  |
| `.re-field`              | `<label>`                       | `re-field--inline` for checkbox/radio rows                         |
| `.re-field-group`        | `<fieldset>`                    | `data-orientation`: horizontal                                     |
| `.re-validation-message` | `<span>`                        | `data-tone`: success, hint, warning                                |
| `.re-disclosure`         | `<details>`                     | `data-variant`: plain                                              |
| `.re-dialog`             | `<dialog>`                      | `showModal()` surface with header/body/footer slots                |
| `.re-tabs`               | container                       | pairs with `[role="tablist"]`, `[role="tab"]`, `[role="tabpanel"]` |
| `.re-menu`               | container                       | pairs with `[role="menu"]`, `[role="menuitem"]`                    |
| `.re-popover`            | `[popover]` element             | `data-tone`: info, warning, danger                                 |
| `.re-toast-region`       | live region host                | —                                                                  |
| `.re-progress`           | `<progress>`                    | `data-size`: sm, md, lg                                            |
| `.re-meter`              | `<meter>`                       | `data-size`: sm, md, lg                                            |

## JavaScript behaviors

Each behavior accepts a root (`Document`, `Element`, or `ShadowRoot`), wires up the pattern, and returns `{ destroy() }`.

```js
import { enhanceTabs } from "@relements/core/behaviors/tabs";

const controller = enhanceTabs(document);
// later:
controller.destroy();
```

| Behavior               | What it does                                     | Key event    |
| ---------------------- | ------------------------------------------------ | ------------ |
| `enhanceTabs`          | Arrow keys, Home/End, roving tabindex            | `re-change`  |
| `enhanceMenuButton`    | Keyboard nav, outside-click close                | `re-select`  |
| `enhanceDialog`        | Trigger binding, close buttons, backdrop dismiss | —            |
| `enhancePopover`       | Anchored positioning, toggle event bridge        | `re-toggle`  |
| `enhanceDismissible`   | Dismiss buttons via `[data-re-dismiss]`          | `re-dismiss` |
| `showToast(msg, opts)` | `aria-live` toast notifications                  | —            |

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

| Tag            | Wraps               | Exposes                             |
| -------------- | ------------------- | ----------------------------------- |
| `<re-tabs>`    | `enhanceTabs`       | `.value` (selected tab id)          |
| `<re-toast>`   | `showToast`         | `.show(message, options)`           |
| `<re-menu>`    | `enhanceMenuButton` | `.open` boolean                     |
| `<re-popover>` | `enhancePopover`    | `.show()` / `.hide()` / `.toggle()` |

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

### Built-in dark theme

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

| Token                   | Light default | Purpose                    |
| ----------------------- | ------------- | -------------------------- |
| `--re-color-accent-600` | `#2563eb`     | Buttons, links, focus ring |
| `--re-color-bg`         | `#ffffff`     | Page background            |
| `--re-color-surface`    | `#ffffff`     | Card / panel background    |
| `--re-color-text`       | `#0f172a`     | Body text                  |
| `--re-color-border`     | `#e2e8f0`     | Borders                    |
| `--re-color-focus-ring` | `#3b82f6`     | Keyboard focus indicator   |
| `--re-space-4`          | `1rem`        | Base spacing (4 px scale)  |
| `--re-radius-md`        | `0.375rem`    | Default radius             |

Full list in [`src/tokens.css`](./src/tokens.css).

## License

MIT — [Renascent Elements](https://renascentelements.hu)
