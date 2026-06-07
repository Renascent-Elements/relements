---
"@relements/core": minor
---

Add a light variant to the Renascent Elements theme.

`themes/renascent.css` now follows `prefers-color-scheme`: brand dark on dark
systems, brand light on light systems. The new `.theme-renascent-light` and
`.theme-renascent-dark` classes force a scheme regardless of the OS.

**Behavior change:** the theme was previously always dark. Add the
`.theme-renascent-dark` class to a container (or `:root`) to keep forced-dark
behavior.

**Accessibility:** fixed WCAG AA contrast in the theme — buttons now use white
text on accent/danger fills (was dark text), and status surfaces (alert tints)
now render correctly in dark scope. These adjust the dark theme's button text
and alert colors slightly.
