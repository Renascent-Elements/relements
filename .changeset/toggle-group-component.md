---
"@relements/core": minor
---

Add the **toggle-group** component — a CSS-only, multi-select cluster of toggle
buttons built on native checkboxes. `.re-toggle-group` (a `<fieldset>`) of
`__option`s, each a `<input type="checkbox">` (own `name`/`value`) + a visible
`<span>`; visually joined like a button-group, pressed = accent fill. The
many-of-N sibling of the single-select `.re-segmented` (for stateless joined
actions, use `.re-button-group`). Native pressed state + form submission (no
JS), `aria-label`-named fieldset, `data-size="sm"` / `"lg"`, and a forced-colors
`Highlight` fill so the on/off distinction never rides colour alone.
