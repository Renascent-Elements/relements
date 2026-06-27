---
"@relements/core": minor
---

Accessibility hardening across the JavaScript behaviors — make dynamic status reach screen readers, fix focus drops, and tighten the keyboard model. axe was already clean; these close the semantics it can't see.

- **multi-select** — a polite live region announces the "N selected" count (toggling boxes while the panel was open was silent), and a blocked required submit now mirrors `aria-invalid` + `aria-describedby` onto the focused summary with a `role="alert"` message (previously both sat on the collapsed `<fieldset>`, so the failure was unspoken). Dropped `aria-roledescription="multi-select"`, which suppressed the native collapsed/expanded state cue.
- **command-palette** — an always-present `role="status"` line announces the result count as you filter ("3 results") and the empty state; the old empty region was toggled `hidden` then populated in the same tick, so it often didn't speak.
- **carousel** — prev/next at the ends use `aria-disabled` instead of the native `disabled` property (which dropped keyboard focus to `<body>` and removed them from the a11y tree); pausing autoplay announces the settled slide; off-screen inerting **and** the settle announcement now work at any slide-per-view count.
- **context-menu** — Space activates the focused item without polluting the typeahead buffer; a scroll/resize dismissal returns focus to the region instead of `<body>`.
- **tags-input** — a rejected duplicate is announced (it was silent); a repeated identical message re-announces; the editor is `aria-describedby` its field hint; chips are exposed as a `role="list"`.

No API changes — every fix is an attribute or live-region addition to the existing behaviors.
