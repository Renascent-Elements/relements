---
title: Theming & tokens
description: Design tokens, cascade layers, and subtree theming.
---

Relements is themed entirely through CSS custom properties and is organized with native CSS cascade layers. There is no runtime theming engine — retheming is plain CSS.

## Cascade layers

The core entry stylesheet declares its layer order up front, then imports each part into the matching layer:

```css
@layer re.tokens, re.reset, re.base, re.components;

@import "./tokens.css" layer(re.tokens);
@import "./reset.css" layer(re.reset);
@import "./base.css" layer(re.base);

/* Components */
@import "./components/button.css";
@import "./components/link.css";
/* …one import per component… */
```

Layers earlier in the `@layer` declaration lose to layers later in it when specificity ties, so the precedence runs lowest → highest:

1. **`re.tokens`** — design tokens: the `--re-*` custom properties everything else reads from.
2. **`re.reset`** — minimal cross-browser normalization.
3. **`re.base`** — document-level typography and native element defaults.
4. **`re.components`** — the opt-in `.re-*` component styles.

Component styles sit in the highest layer, so they win over base and reset rules without needing high-specificity selectors.

## Consumer overrides always win

The component `@import`s are pulled in **without** a `layer(...)` clause, so component CSS lands in the `re.components` layer, while anything you write in your own stylesheet (outside any `@layer`) lives in the **unlayered** cascade.

Unlayered styles beat all layered styles regardless of specificity. That means a plain rule you author overrides Relements component styles automatically — you do not need `!important` or selector escalation to retheme:

```css
/* Your stylesheet — unlayered, wins over re.components */
.re-button {
  border-radius: 0;
}
```

## Tokens

Visual appearance is driven by `--re-*` custom properties. The token names are stable public API. Examples from the shipped theme include color roles such as `--re-color-bg`, `--re-color-bg-subtle`, `--re-color-surface`, `--re-color-text`, `--re-color-text-muted`, `--re-color-border`, the accent ramp `--re-color-accent-50` … `--re-color-accent-900`, semantic roles like `--re-color-link`, `--re-color-focus-ring`, `--re-color-text-on-accent`, feedback ramps such as `--re-color-success-600`, `--re-color-warning-600`, `--re-color-danger-600`, and effect tokens like `--re-focus-ring-offset` and `--re-shadow-focus`.

## Subtree theming

Because tokens are ordinary custom properties, you retheme a subtree by redeclaring the tokens on any ancestor element. Custom properties inherit, so every descendant that reads a token picks up the new value:

```html
<div style="--re-color-accent-600: #7c3aed;">
  <button class="re-button" data-variant="primary">Themed</button>
</div>
```

Any selector works — a class, an attribute, a media query, or `:root` for the whole document.

## Loading a theme

The optional Renascent brand theme is published as a package export. The exact subpath, `@relements/core/themes/renascent.css`, is declared in the package `exports` map, so you can import it directly:

```js
import "@relements/core/index.css";
import "@relements/core/themes/renascent.css";
```

The theme file is **un-layered**, so its token values win over the layered defaults — and your own unlayered overrides still win over the theme. It ships two ways to apply itself:

- **Global** — it redeclares the tokens on `:root` (with `color-scheme: dark`), retheming the whole document.
- **Scoped** — it also defines a `.theme-renascent` class carrying the same tokens, so you can theme just a subtree by putting the class on a container:

  ```html
  <div class="theme-renascent">…</div>
  ```

The theme also adds a couple of decorative extras layered on the same token approach — brand color tokens such as `--re-color-phoenix` and `--re-color-purple`, gradient tokens like `--re-gradient-brand` and `--re-gradient-phoenix`, and matching `data-variant="phoenix"` / `data-variant="brand"` gradient styles for `.re-button`.
