---
"@relements/core": patch
---

Enforce the CSS-authoring conventions with Stylelint, and fix the RTL bug it caught.

- **Tooling:** a convention-only Stylelint config (`stylelint.config.mjs`, wired into `pnpm lint`) guards the house rules on component CSS — tokens-only colors, logical properties, and the browser floor (`lh`/`:dir()` are banned). Prettier still owns formatting.
- **Fix:** `drawer` and `tooltip` used `:dir()` for their RTL transforms, which needs Safari 16.4 — above the documented Safari 15.4 floor — so their RTL silently degraded on older Safari. Converted to `[dir="rtl"]` (matching the rest of the library), which works on the full floor; specificity is preserved (each `:dir()`/`[dir]` contributes equally), so the drawer's dock-ordering is unchanged. Added an RTL test for the tooltip (the drawer already had one).
- Plus a no-op logical-property cleanup (two horizontal-rule `border-top` → `border-block-start`).
