---
"@relements/core": patch
---

Align the scoped Renascent theme's `--re-color-accent-500` tint with the global
dark ramp (`#60a5fa`). Previously `.theme-renascent` / `.theme-renascent-dark`
used `#3c83f6` for the 500 step while the global `:root` dark used `#60a5fa`, so
the accent tint differed depending on how the theme was applied. No change to
button/link colors (600/700 unchanged).
