---
"@relements/core": minor
---

Add three display components:

- **`.re-progress-ring`** (CSS only) — a circular progress indicator with no native equivalent, drawn entirely in CSS: a `conic-gradient` sweep masked into a ring with the `%` label in the centre. `role="progressbar"` with `aria-valuenow`/`aria-valuetext`, `data-size` sm/md/lg, and a `data-indeterminate` spinner that respects `prefers-reduced-motion`. Under forced colors (where the gradient is dropped) the numeric label stays visible and a neutral `CanvasText` track ring is drawn, so the control still reads as a ring. New export `@relements/core/components/progress-ring.css`.
- **`.re-avatar-group`** — an overlapping avatar stack with an optional `.re-avatar-group__count` overflow chip ("+3"). `role="group"` + an `aria-label` that owns the real total; each avatar's page-colour separation border becomes a real `CanvasText` outline under forced colors. Extends `avatar.css`.
- **`.re-separator[data-label]`** — a labeled divider (a horizontal rule with centred text, e.g. "OR"). The lines are pseudo-elements with a real border (so they survive forced colors); the label rides the rendered text node and the host declares an explicit `aria-orientation`. `data-align` start/center/end. Extends `separator.css`.
