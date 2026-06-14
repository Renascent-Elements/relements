---
"@relements/core": minor
---

Add the **banner** component — a full-bleed, page-level announcement strip (cookie notice, maintenance window, promo, system status). A single horizontal row: leading icon + message + optional inline action + dismiss, spanning its container edge-to-edge with no rounded card border, optionally `data-sticky` pinned to the top. `data-variant="info|success|warning|danger"` tones; `data-emphasis="solid"` swaps the tint for a bold `*-700` fill + white text (AA-contrast verified); `data-align="center"` caps the message at a readable measure while the fill stays full-bleed. Dismiss reuses the existing `enhanceDismissible` behavior (`data-re-dismissible` / `data-re-dismiss`) — no new JavaScript. Distinct from `alert` (a rounded, inset, always-subtle inline card) on geometry + solid emphasis. (Docs note: `enhanceDismissible` hides for the session only; persist "don't show again" in the consumer.)
