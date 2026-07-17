---
"@relements/core": patch
---

Fix choice card control alignment under host CSS resets: the radio/checkbox's optical centering offset now rides a `transform` instead of `margin-block-start`. An unlayered `* { margin: 0 }` reset (Starlight, common app resets) beats the `re.components` layer and zeroed the margin, leaving the control about 3px above the title's vertical center, including on the docs site's own demos. No visual change on reset-free pages.
