---
"@relements/core": minor
---

Add the **file picker** — a custom-styled file selection control, the richer sibling of `.re-file`. A progressive-enhancement ladder:

- **`.re-file-picker`** (CSS only) — a styled drop/browse area built by visually hiding the native `<input type="file">` (which stays the form value). Click-to-pick works with no JavaScript. `data-size` sm/md/lg, aria-invalid/disabled states. New export `@relements/core/components/file-picker.css`.
- **`enhanceFilePicker`** — echoes the selected filenames (visible list + an sr-only `role="status"` announcement), wires drag-and-drop, a clear button, and `accept`/`data-re-file-max-files`/`data-re-file-max-size` validation. A rejected drop sets `aria-invalid` and emits `re-error` (`{ reason, rejected, accepted }`); value changes use the native `change` event. New export `@relements/core/behaviors/file-picker`.
- **`<re-file-picker>`** — a thin custom-element wrapper: reflects `name`/`multiple`/`accept`/`disabled`/`required` onto the input, exposes `.files` (read/write) and `.clear()`, and runs the behavior on connect. New export `@relements/core/elements/re-file-picker`.

Built to the project's a11y conventions: the picker is keyboard-operable via the native OS picker (drag-drop is a pointer-only enhancement), the focus ring shows on the visible UI via `:focus-within` (restored under forced colors), the clear button sits outside the `<label>` so it can't reopen the picker, and dark/forced-colors states stay distinguishable.
