---
"@relements/core": patch
---

Polish the native picker indicator on temporal `.re-input`s (`date`, `time`, `datetime-local`, `month`, `week`): a larger hit area, pointer cursor, and a hover wash on `::-webkit-calendar-picker-indicator`. Chromium-only (scoped with `@supports`; WebKit and Firefox keep their native indicator), excludes `.re-combobox`, adapts to dark via `color-scheme`, and drops the dim/wash under forced colors so the glyph keeps system contrast. No new API — the base `.re-input` already styles these fields on every engine.
