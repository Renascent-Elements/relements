---
"@relements/core": patch
---

Internal: enforce the CSS-authoring conventions with Stylelint (`pnpm lint` now also runs `stylelint` on component CSS — tokens-only colors, logical properties, and the browser floor: `lh`/`:dir()` are banned). No consumer-facing change beyond a no-op logical-property cleanup (two horizontal-rule `border-top`s → `border-block-start`).
