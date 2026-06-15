---
title: Dark mode
description: Automatic prefers-color-scheme dark mode, forcing a scheme, and the Renascent brand theme.
---

Dark mode is built into the core — there is nothing to wire up. Importing the stylesheet gives you light **and** dark, and the page follows the operating-system preference automatically. Like everything else in Relements, the mechanism is plain CSS custom properties (see [Theming & tokens](/relements/guides/theming/)), so you can override or force a scheme without any runtime engine.

## Automatic, zero-config

`tokens.css` defines the light palette on `:root`, then remaps the role tokens inside an `@media (prefers-color-scheme: dark)` block:

```css
@layer re.tokens {
  :root {
    --re-color-bg: var(--re-color-neutral-0); /* #ffffff */
    --re-color-text: var(--re-color-neutral-900);
    --re-color-border: var(--re-color-neutral-200);
    /* …light roles… */
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --re-color-bg: var(--re-color-neutral-950);
      --re-color-text: var(--re-color-neutral-50);
      --re-color-border: var(--re-color-neutral-700);
      /* …dark roles… */
    }
  }
}
```

Only the **role** tokens (`--re-color-bg`, `--re-color-surface`, `--re-color-text`, `--re-color-border`, the link/focus/selection roles, and the status surfaces) are remapped — the raw neutral and accent ramps stay fixed, and every component reads the roles. So importing the entry stylesheet is all it takes:

```js
import "@relements/core/index.css";
```

```html
<link rel="stylesheet" href="node_modules/@relements/core/dist/index.css" />
```

When the OS is in dark mode, the page renders dark; in light mode, light. No class, no script, no flash-of-wrong-theme toggle to manage.

The dark block also fixes one rendering detail: it zeroes `--re-focus-ring-offset` (and collapses `--re-shadow-focus` to a single ring) because the white-gap focus-ring trick only reads on light backgrounds — on a near-black page the offset gap is invisible and the border plus outer ring would otherwise show as two separate blue lines.

## Forcing a scheme regardless of OS

Sometimes you want a fixed scheme — a settings toggle, a marketing page that is always dark, or a single dark panel on a light page. Because the dark values live behind a media query, you force a scheme by redeclaring the role tokens yourself and setting `color-scheme` so native UI (scrollbars, form controls, the `<dialog>` `::backdrop`) matches.

Force dark on the whole document:

```css
:root {
  color-scheme: dark;
  --re-color-bg: var(--re-color-neutral-950);
  --re-color-surface: var(--re-color-neutral-900);
  --re-color-text: var(--re-color-neutral-50);
  --re-color-border: var(--re-color-neutral-700);
  /* …redeclare the remaining dark roles… */
}
```

If you drive the scheme from an attribute (e.g. a JS toggle that sets `data-theme="dark"`), scope the same redeclaration to that selector instead of `:root`.

The least-effort way to force a scheme, though, is to load the built-in [Renascent theme](#the-renascent-brand-theme) — it ships ready-made `.theme-renascent-dark` and `.theme-renascent-light` classes that pin a scheme regardless of OS.

## Subtree theming

The same redeclaration works on **any** ancestor, not just `:root`. Custom properties inherit, so a token set on a container cascades to every component inside it — that is how you get a dark panel on a light page (or vice versa) with no overrides:

```html
<!-- Light page, one dark card -->
<div
  style="
  color-scheme: dark;
  --re-color-surface: var(--re-color-neutral-900);
  --re-color-text: var(--re-color-neutral-50);
  --re-color-border: var(--re-color-neutral-700);
"
>
  <article class="re-card">…</article>
</div>
```

Any selector works — a class, an attribute, a media query, or `:root` for the whole document. See [Theming & tokens](/relements/guides/theming/) for the full subtree-theming model and the cascade-layer rules that make consumer overrides win.

## The Renascent brand theme

The core's automatic dark mode is a neutral slate palette. If you want the **Renascent** brand look — a dark navy palette with electric-blue primary, purple accent, and the signature phoenix orange — load the optional theme on top:

```js
import "@relements/core/index.css";
import "@relements/core/themes/renascent.css";
```

```html
<link rel="stylesheet" href="node_modules/@relements/core/dist/index.css" />
<link rel="stylesheet" href="node_modules/@relements/core/dist/themes/renascent.css" />
```

`themes/renascent.css` is **un-layered**, so its token values win over the layered defaults — and your own unlayered overrides still win over the theme. It applies itself two ways:

- **Global, scheme-aware** — it redeclares the tokens on `:root` (defaulting to its dark navy palette with `color-scheme: dark`) and swaps to the light brand palette under `@media (prefers-color-scheme: light)`. So the global theme still follows the OS, just with the brand colors.
- **Scoped** — it also defines `.theme-renascent` (dark, OS-aware light) plus the forced variants `.theme-renascent-dark` and `.theme-renascent-light`. Put one on any container to theme just that subtree:

  ```html
  <div class="theme-renascent">…</div>
  ```

The theme also adds brand extras layered on the same token approach: color tokens such as `--re-color-phoenix` and `--re-color-purple`, gradient tokens like `--re-gradient-brand` and `--re-gradient-phoenix`, and matching `data-variant="phoenix"` / `data-variant="brand"` gradient styles for [`.re-button`](/relements/components/button/).

## Gotchas

- **`--re-color-bg-subtle` collapses toward surface in dark.** In the light palette `bg`, `bg-subtle`, and `surface` are three distinct steps, but in dark `--re-color-bg-subtle` sits very close to `--re-color-surface`. For a _raised_ or _hover_ surface that needs to read as lifted on a dark page, use `--re-color-bg-muted` (which maps to a brighter neutral step) rather than `bg-subtle`.
- **The modal scrim is `--re-color-overlay`.** The dialog/drawer backdrop uses `--re-color-overlay` (default `rgb(0 0 0 / 0.4)`), _not_ one of the `bg-*` roles. It is intentionally scheme-independent — a translucent black that darkens whatever is behind the modal in both light and dark. If you want a different scrim, override that token, not the background roles.

## Related

- [Theming & tokens](/relements/guides/theming/) — cascade layers, subtree theming, loading a theme.
- [Token reference](/relements/guides/tokens/) — every `--re-*` token and its light/dark values.
