---
"@relements/core": minor
---

Conformance hardening (1/2) — dark-mode coverage + a themeable modal scrim.

- **New `--re-color-overlay` token** for the modal scrim. `dialog`/`drawer` `::backdrop` now reads it instead of a hardcoded `rgb(0 0 0 / 0.4)` literal, so the backdrop is themeable like everything else (value unchanged — purely additive).
- **Dark-mode visual baselines** added for the components that consume the risky dark tokens (status tints, surfaces, selected/active states) and previously had light-only coverage: alert, badge, tag, toast, card, table, dialog, popover, combobox, tabs. This locks in the documented dark-token behavior (e.g. status-surface remaps, the `bg-muted` vs `bg-subtle` hover distinction) so a dark regression now fails CI instead of shipping silently. No API or runtime change.
