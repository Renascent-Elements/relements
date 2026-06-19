---
"@relements/core": minor
---

Add two native form inputs, completing native input coverage — both CSS-only (no JavaScript), styling the native control in place:

- **`.re-file`** — `<input type="file">` with a restyled `::file-selector-button` (neutral filled button) and a framed field; the browser's filename text stays native. `data-size`: sm/md/lg, plus `aria-invalid` and `:disabled` states. New subpath export `@relements/core/components/file.css`.
- **`.re-color`** — `<input type="color">` with a framed, rounded swatch sized from the control-height scale (vendor swatch chrome stripped). `data-size`: sm/md/lg. New subpath export `@relements/core/components/color.css`.

Both stay distinct in dark mode (`bg-muted`, not `bg-subtle`) and keep a solid border so they read correctly under forced colors.
