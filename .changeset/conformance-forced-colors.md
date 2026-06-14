---
"@relements/core": minor
---

Conformance hardening (2/2) — Windows High Contrast / forced-colors support.

In forced-colors mode the browser strips `box-shadow` and flattens background/text to system colors, so the library's `box-shadow` focus rings disappeared and any state shown only by a background (selected/current/checked/pressed/active) became invisible to High-Contrast users.

- **Global focus restore:** `base.css` now adds a real `outline: 2px solid Highlight` for `:focus-visible` under `@media (forced-colors: active)`, so every focusable element keeps a visible focus indicator (it overrides the components that opt into an inset `box-shadow` ring).
- **State indicators** are re-established with system colors (`Highlight` / `HighlightText`) under forced-colors on: tabs (selected underline), segmented (checked pill), switch (checked track), tree (current leaf), pagination (current page), toolbar (pressed toggle), command-palette + combobox (active option), checkbox/radio (checked), and rating (filled stars + read-only display).

No effect outside forced-colors mode (all rules are media-scoped), so normal light/dark rendering is unchanged. Validated with a Chromium forced-colors test suite.
