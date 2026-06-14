---
"@relements/core": minor
---

Add power-user Tier-2 components:

- **range** — a two-thumb min–max slider built from two overlaid native range inputs (reuses `.re-slider`). Works with zero JS; `enhanceRange` prevents the thumbs from crossing (value-clamped, so each thumb maps to the full track and `aria-value*` stays honest), draws the fill, and routes track clicks. `data-size`, `data-re-range-gap`.
- **context-menu** — a pointer-positioned right-click menu (also ContextMenu key / Shift+F10) reusing `.re-menu__panel`. Fixed-position above modals; light-dismiss + Escape + typeahead. `enhanceContextMenu` dispatches `re-select`; the native menu is the no-JS fallback.
- **command-palette** — a ⌘K modal launcher composing the dialog + the combobox listbox model. `enhanceCommandPalette` adds the combobox/listbox ARIA on enhance (not in static markup), type-to-filter, arrow-key activedescendant navigation, an optional global hotkey, and dispatches `re-command`. No-JS baseline is a searchable dialog of real links.
