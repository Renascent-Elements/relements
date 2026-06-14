---
"@relements/core": minor
---

Add the **steps** component — an ordered process indicator (stepper) built on a native `<ol class="re-steps">` of `<li data-status>` steps. Zero JavaScript: markers auto-number via a CSS counter, a complete step swaps its number for a pure-CSS check, and the connecting rail (which tints accent up to the last complete step) is drawn entirely in CSS. `data-orientation="vertical"` (default) / `horizontal`, `data-size="sm|md|lg"` (mirrors progress). Ordered-list semantics are kept (stripped visually in CSS, not via `role="list"`, so "N of M" survives); `aria-current="step"` marks the current `<li>`; markers are decorative. A completed step's content may be a real `<a href>`/`<button>`. Deliberately not an ARIA `role="tree"`/`tablist` widget — a display indicator, honest about its semantics.
