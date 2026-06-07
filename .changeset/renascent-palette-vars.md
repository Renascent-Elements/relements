---
"@relements/core": minor
---

Expose the Renascent theme's per-scheme palette as `--re-rn-light-*` /
`--re-rn-dark-*` custom properties.

`themes/renascent.css` now defines its light and dark brand palettes as
always-available custom properties (backgrounds, text, borders, links,
selection, focus, status surfaces, and the interactive accent steps), and
references them internally. Consumers that drive theming with their own
mechanism (e.g. a `data-theme` attribute) can map these vars to `--re-color-*`
without duplicating the brand values. No visual change to the theme itself.
