---
"@relements/core": minor
---

Add the `enhanceCombobox` behavior (`@relements/core/behaviors/combobox`):
an opt-in (`data-re-combobox`) styled suggestion list over the native
`<input list>` + `<datalist>` base. The list is never narrower than the
input, reads the same `<datalist>` as its live data source, follows the
ARIA editable-combobox pattern (filtering, Arrow/Enter/Escape,
`aria-activedescendant`), and fires `input`/`change` on commit. Without
JavaScript — or without the Popover API — the markup keeps the browser's
native suggestion popup.
