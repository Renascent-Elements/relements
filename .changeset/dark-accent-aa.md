---
"@relements/core": patch
---

Fix WCAG AA contrast for primary buttons in the global dark Renascent theme.

The dark theme's button base (`--re-color-accent-600`) was the brand `#3c83f6`,
on which white button text is only ~3.6:1 (below AA). It now uses `#2563eb`
(white 5.17:1), matching the light theme and the `.theme-renascent-dark` class —
so dark primary/danger buttons are accessible regardless of how the theme is
applied. `#3c83f6` remains the brand tint/gradient color.
