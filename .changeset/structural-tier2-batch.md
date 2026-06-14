---
"@relements/core": minor
---

Add structural Tier-2 components:

- **button-group** — CSS-only cluster that joins `.re-button`s into one control (collapsed seams, outer corners only; horizontal/vertical).
- **empty-state** — CSS-only centered "no data / no results" placeholder (icon, title, description, actions; `data-size="sm"`, `data-bordered`, and a `.re-empty-state-cell` helper for table-empty cells).
- **toolbar** — `.re-toolbar` band (`role="toolbar"`) plus the optional `enhanceToolbar` behavior for the ARIA roving-tabindex model (one Tab stop, Arrow/Home/End, RTL-aware, composes with a hosted `.re-menu`). Fully usable with zero JS.
