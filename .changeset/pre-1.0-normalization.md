---
"@relements/core": minor
---

Pre-1.0 API & token normalization (settling public names before they freeze).

**Breaking — semantic color is now `data-tone` everywhere.** The info/success/warning/danger/neutral palette is expressed with `data-tone` on every component that carries it. `alert`, `badge`, `banner`, and `tag` move from `data-variant` → `data-tone` (toast/popover/form already used `data-tone`). `data-variant` is now reserved for _structural_ variation (button primary/secondary/ghost/danger, link muted/subtle/external, tree `lines`, disclosure `plain`) and is unchanged on those.

- Migration: `<div class="re-alert" data-variant="success">` → `data-tone="success"` (same for `re-badge`, `re-tag`, `re-banner`).
- `enhanceTagsInput`: the `data-re-tags-variant` option is renamed `data-re-tags-tone` (it sets the chip's `.re-tag` tone).

**Breaking — duplicate `danger` color tokens removed.** `--re-color-text-danger` and `--re-color-border-danger` (role-first) are dropped in favor of the semantic-first spelling that `success`/`warning`/`info` already use exclusively. Use `--re-color-danger-text` and `--re-color-danger-border` (identical values; the renascent theme already themes these). Anyone overriding the old names should rename them.

**Non-breaking fixes:** the granular-import docs now lead with the required `tokens.css` (single-component imports were rendering unstyled); the npm tarball ships `dist` only (drops `src`, ~halving install size) and adds a `"./package.json"` export; the toast dismiss hover uses `--re-color-bg-muted` (was invisible in dark); and the tooltip (WCAG 1.4.13 is Hoverable + Persistent, not Dismissable) and tabs (automatic, not manual, activation) docs are corrected.
