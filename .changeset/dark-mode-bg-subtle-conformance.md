---
"@relements/core": patch
---

Fix a dark-mode conformance regression across several components and add forced-colors support to progress/meter (found by a full-library conformance audit).

`--re-color-bg-subtle` collapses to the surface colour in dark mode, so hover/raised states built on it became invisible against a card. Re-based those on `--re-color-bg-muted` (which stays distinct in both schemes), with the press state on button kept distinct via a `color-mix` step: **accordion, button (ghost/secondary), card footer, dialog & drawer (close + footer), disclosure, pagination, tabs**, and the **table** zebra stripe (now a faint text-wash that stays weaker than the row hover).

`progress`/`meter` gained a `@media (forced-colors: active)` block so the fill level stays visible in Windows High Contrast (Highlight fill on a Canvas track) — previously the fill was conveyed by colour alone.
