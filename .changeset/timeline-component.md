---
"@relements/core": minor
---

Add the **timeline** component — a CSS-only vertical, chronological event list.
`.re-timeline` (a native `<ol>`) of `__item`s, each a decorative dot on a
continuous connector rail with a `__title`, a `<time class="re-timeline__time"
datetime="…">`, and an optional `__description`. Mark the latest/active event
with `data-current` (accent dot — pair with `aria-current`). `data-size="sm"`
compact variant. Ordered-list semantics are kept (stripped in CSS, not
`role="list"`); dots/rail are `aria-hidden`, so meaning rides the title + time.
