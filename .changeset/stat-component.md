---
"@relements/core": minor
---

Add the **stat** component — a CSS-only metric / KPI display. `.re-stat` shows a
`__label`, a prominent `__value` (tabular figures), and an optional `__trend`
(`data-trend="up|down|flat"` — direction carried by an arrow glyph + colour + an
author-supplied `.re-sr-only` word, never colour alone) and `__description`.
Compose a row with `.re-stat-group` (`data-divided` for separators).
`data-size="sm"` and `data-align="center"` variants.
