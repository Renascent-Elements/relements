---
"@relements/core": patch
---

Survive host margin resets: index.css now ends with a small UNLAYERED "reset-hardened geometry" block. A host's unlayered `* { margin: 0 }` (Starlight, Tailwind preflight, common reset snippets) outranks the `re.components` layer and was stripping margins that are structural, not decorative: the button-group and toggle-group seam collapse (leaving doubled 2px borders), the avatar-group overlap (stack fell apart), the empty-state's `margin-inline: auto` centering, and the UA `dialog:modal { margin: auto }` that centers modal dialogs. Those six declarations are re-asserted outside any layer, where their classed selectors beat `*` on plain specificity, so they hold in any host while remaining overridable by normal consumer CSS (values stay token-derived for theming). Guarded by a spec that injects the hostile reset per component.
