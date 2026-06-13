---
"@relements/core": minor
---

Add the overlay + structure batch:

- **Drawer** (`.re-drawer`) — an edge-anchored panel: a native modal `<dialog>`
  with `.re-drawer` added alongside `.re-dialog`, reusing `enhanceDialog`
  verbatim. `data-side="end|start|top|bottom"` (logical insets, RTL-aware),
  `data-size="sm|md|lg"`, and a `@starting-style` slide that degrades to instant.
- **Alert dialog** — a dialog recipe: `role="alertdialog"` + `aria-labelledby`/
  `aria-describedby` + `autofocus` on the safe action. New
  `data-re-dialog-no-dismiss` hook (read by `enhanceDialog`) blocks Escape and
  backdrop dismissal for must-choose confirmations; explicit close buttons still
  work, and it warns if none is present.
- **`enhanceAutosize`** (`@relements/core/behaviors/autosize`) — grows a
  `.re-textarea[data-autosize]` with its content. CSS `field-sizing: content`
  where supported; a `scrollHeight` fallback otherwise; a plain resizable
  textarea with no JS. Cap via `--re-autosize-max-block-size`.
- **Description list** (`.re-description-list`) — read-only key/value pairs on a
  native `<dl>`. CSS-only; `data-layout="stacked|horizontal"`, plus
  `data-bordered`, `data-divided`, `data-density="compact"`, and a
  `--re-dl-term-width` knob.
