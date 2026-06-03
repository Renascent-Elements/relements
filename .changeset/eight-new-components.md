---
"@relements/core": minor
---

Add eight components: **alert**, **badge**, **card**, **tag**, **avatar**, **breadcrumb**, **accordion**, and **switch**.

All are pure CSS in the `re.components` cascade layer with per-component CSS exports (`@relements/core/components/<name>.css`). Alert and Tag reuse the existing `enhanceDismissible` behavior for dismissal; Accordion uses the native `<details name>` attribute for single-open exclusivity (no JavaScript), degrading to independent disclosures on older browsers; Switch is a styled `<input type="checkbox" role="switch">`.

Also adds status-surface design tokens (`--re-color-{info,success,warning,danger}-surface/-border/-text`) with dark-scheme overrides.
