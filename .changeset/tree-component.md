---
"@relements/core": minor
---

Add the **tree** component — a CSS-only nested-disclosure navigation tree built on native `<details>`/`<summary>` branches and `<a>`/`<button>` leaves. Zero JavaScript: expand/collapse, keyboard, focus order, and navigation are all native. Structural indentation (can't desync from the markup, RTL-correct), reused disclosure chevron, aligned leaf labels via a reserved gutter, `aria-current` selection, optional `data-variant="lines"` guide lines and `data-density="compact"`. Deliberately not an ARIA `role="tree"` widget (that keyboard model is out of scope), so it's honest about its semantics — every control is independently Tab-focusable.
