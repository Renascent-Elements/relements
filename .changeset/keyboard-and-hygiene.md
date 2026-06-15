---
"@relements/core": minor
---

Keyboard-accessibility completeness + build hygiene.

- **`enhanceMenuButton`** now supports first-character **typeahead** (multi-char buffer, like `enhanceContextMenu`) and treats **`aria-disabled`** items as inert to both keyboard navigation and clicks (previously they were focusable/activatable).
- The **combobox** and **command-palette** listboxes now support **Home/End** to jump to the first/last option (Home/End still moves the text caret when the combobox listbox is closed).
- **Deterministic builds:** the CSS build step now cleans `dist/` first, so removed components/behaviors no longer leave orphan chunks behind in a local `dist`.
