---
"@relements/core": minor
---

Add choice card (`.re-choice`) — a selectable card built on a native, visible radio or checkbox. CSS-only: the card-level selection ring rides `:has(:checked)`, keyboard roving and form participation are native. `.re-choice-group` wraps a set in a `<fieldset>` (stacked by default, `data-orientation="horizontal"` for an equal-width row); `__title` and `__description` structure the card text. Checked state survives Windows High Contrast via a `Highlight` border, and the native control's glyph keeps the state visible to everyone regardless.
