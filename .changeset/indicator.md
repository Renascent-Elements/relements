---
"@relements/core": minor
---

Add indicator (`.re-indicator`): a count bubble or status dot pinned to the corner of any element (unread counts, "new" dots, mention counts). CSS-only. `.re-indicator__badge` renders a circle for one digit and grows into a pill; `data-dot` renders a small textless dot; `data-tone` (danger default, info/success/warning/neutral) uses the solid `*-700` scale with `text-on-accent` for AA count text; `data-position="bottom-end"` for the lower corner. Corners are logical (RTL mirrors free), the bubble survives forced colors via `Highlight` at matched specificity, and the docs/tests enforce that every badge carries real text for assistive tech (sr-only suffix, sr-only dot content, or the target's `aria-label`).
