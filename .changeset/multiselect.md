---
"@relements/core": minor
---

Add **multi-select** — multi-selection without a custom ARIA widget.

- **`.re-multiselect`** (CSS only) — a native `<details>` / `<summary>` disclosure wrapping a `<fieldset>` of `.re-checkbox`es. One `name`, many values, real form submission, native keyboard; the summary mirrors `.re-select`, the panel is a plain absolute dropdown, and a closed `<details>` keeps its checkboxes out of the tab order natively. New export `@relements/core/components/multiselect.css`.
- **`enhanceMultiSelect`** — writes the live "N selected" summary (labels up to a cap, then "+K more"; empty restores the authored placeholder), closes on Escape (returning focus to the summary) and outside-click, and — with `data-re-multiselect-required` — enforces ≥1 selection: blocks the form submit, sets `aria-invalid` on the `<fieldset>`, and reveals the `aria-describedby` validation message. Rides native `change` (no custom event). New export `@relements/core/behaviors/multiselect`.

Built to the a11y conventions: the summary's accessible name is `label + value` (`aria-labelledby`) with `aria-roledescription="multi-select"`; the live value reaches assistive tech through the behavior (documented honestly — the no-JS control still submits but shows only the placeholder); checked boxes keep the `Highlight` fill from `.re-checkbox` under forced colors; the validation message lives outside `<details>` so it stays visible while the control is collapsed.
