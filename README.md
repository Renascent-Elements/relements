# Relements

A small, framework-neutral design system by [Renascent Elements](https://renascentelements.hu).

Semantic HTML first. CSS tokens second. JavaScript only where native behavior falls short.

---

## Install

```bash
npm install @relements/core
# or
pnpm add @relements/core
```

---

## Usage

### Plain HTML

```html
<link rel="stylesheet" href="node_modules/@relements/core/dist/index.css" />

<button class="re-button" data-variant="primary">Save</button>

<label class="re-field">
  <span class="re-field__label">Email</span>
  <input class="re-input" type="email" name="email" />
</label>
```

No bundler, no framework, no JavaScript required for static components.

### With a bundler (Vite, webpack, Rollup…)

```js
// Full bundle
import "@relements/core/index.css";

// Selective — only the components you use
import "@relements/core/components/button.css";
import "@relements/core/components/form.css";

// JavaScript behaviors (tree-shakable ESM)
import { enhanceTabs } from "@relements/core/behaviors/tabs";
import { showToast } from "@relements/core/behaviors/toast";

// Custom elements
import "@relements/core/elements/re-tabs";
```

### TypeScript

All JS exports ship with `.d.ts` declarations generated from JSDoc.

```ts
import { enhanceTabs } from "@relements/core/behaviors/tabs";
// → typed, autocompletion works
```

---

## What's included

### CSS foundation

| Import | Contents |
|---|---|
| `@relements/core/index.css` | Full bundle — tokens + reset + base + all components |
| `@relements/core/tokens.css` | `--re-*` design tokens only |
| `@relements/core/components/button.css` | Button variants, sizes, states |
| `@relements/core/components/form.css` | Input, textarea, select, checkbox, radio, field, validation |
| `@relements/core/components/dialog.css` | Native `<dialog>` surface |
| `@relements/core/components/tabs.css` | Tab list + panel |
| `@relements/core/components/menu.css` | Menu button + items |
| `@relements/core/components/popover.css` | Native `popover` attribute |
| `@relements/core/components/toast.css` | Toast region + items |
| `@relements/core/themes/renascent.css` | Dark brand theme (renascentelements.hu palette) |

### JavaScript behaviors

All behaviors accept a root (`Document`, `Element`, or `ShadowRoot`) and return a `{ destroy() }` controller. They do not auto-initialize.

| Import | What it does |
|---|---|
| `@relements/core/behaviors/tabs` | ARIA tabs — arrow keys, roving tabindex, `re-change` event |
| `@relements/core/behaviors/menu-button` | ARIA menu button — keyboard nav, `re-select` event |
| `@relements/core/behaviors/dialog` | Dialog trigger binding, close buttons, backdrop dismiss |
| `@relements/core/behaviors/popover` | Native popover positioning + `re-toggle` event |
| `@relements/core/behaviors/dismissible` | Dismiss buttons via `[data-re-dismiss]`, `re-dismiss` event |
| `@relements/core/behaviors/toast` | `showToast(message, options)` live-region notifications |

### Custom elements

Light-DOM custom elements that wrap the behaviors. No Shadow DOM, no framework required.

| Tag | Description |
|---|---|
| `<re-tabs>` | Wraps enhanceTabs; exposes `.value` property |
| `<re-toast>` | Toast region with `.show(message, options)` method |
| `<re-menu>` | Wraps menu-button; exposes `.open` property |
| `<re-popover>` | Wraps native popover with `.show()` / `.hide()` / `.toggle()` |

---

## Theming

All visual values are CSS custom properties under the `--re-*` prefix. Override at `:root` for a global theme or on any element for a scoped one.

```css
/* Swap the accent colour globally */
:root {
  --re-color-accent-600: #7c3aed;
  --re-color-accent-700: #6d28d9;
}

/* Scoped dark surface */
.my-card {
  --re-color-bg: #0f131a;
  --re-color-text: #f8fafc;
}
```

Load the built-in dark theme:

```html
<link rel="stylesheet" href="@relements/core/index.css" />
<link rel="stylesheet" href="@relements/core/themes/renascent.css" />
```

Or scope it:

```html
<div class="theme-renascent">
  <!-- Relements components here use the Renascent dark palette -->
</div>
```

---

## Design tokens (key names)

| Token | Default value | Purpose |
|---|---|---|
| `--re-color-accent-600` | `#2563eb` | Primary interactive colour (buttons, links, focus) |
| `--re-color-bg` | `#ffffff` | Page background |
| `--re-color-surface` | `#ffffff` | Card / panel background |
| `--re-color-text` | `#0f172a` | Body text |
| `--re-color-text-muted` | `#475569` | Secondary text |
| `--re-color-border` | `#e2e8f0` | Default border |
| `--re-color-focus-ring` | `#3b82f6` | Keyboard focus indicator |
| `--re-color-danger-600` | `#dc2626` | Error / danger |
| `--re-color-success-600` | `#059669` | Success |
| `--re-color-warning-600` | `#d97706` | Warning |
| `--re-space-4` | `1rem` | Base spacing unit (4px scale) |
| `--re-radius-md` | `0.375rem` | Default border radius |

Full token list: [`packages/core/src/tokens.css`](./packages/core/src/tokens.css)

---

## Principles

- **HTML first** — the baseline is semantic HTML + CSS, no JavaScript required for static use
- **CSS before JavaScript** — visual states are CSS; JS is progressive enhancement only
- **Framework-neutral** — the public API is HTML attributes, CSS classes, and DOM events
- **Accessible by default** — native elements, ARIA patterns, keyboard navigation, axe-core tested
- **Small surface** — no build step to use; one CSS file + optional JS modules

---

## Development

```bash
pnpm install
pnpm exec playwright install chromium
pnpm test          # unit + browser + a11y + visual
pnpm run lint      # Prettier + ESLint
pnpm build         # produce dist/
```

Serve the examples locally:

```bash
pnpm exec http-server . -p 4173 -c-1
# → http://localhost:4173/docs/examples/
```

---

## License

MIT — [Renascent Elements](https://renascentelements.hu)
