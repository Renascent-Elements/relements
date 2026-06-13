---
"@relements/core": minor
---

Add the form-input addon family:

- **Input group** (`.re-input-group`) — a `:focus-within` wrapper that makes an
  input plus prefix/suffix affixes (`.re-input-group__text`), inline action
  buttons (`.re-input-group__action`), or an attached `.re-button` read as one
  control. CSS-only; shared foundation for the two behaviors below.
- **Segmented control** (`.re-segmented`) — a single-select pill group built on
  native radio inputs, so arrow-key roving, single-selection, and form value are
  native. CSS-only.
- **`enhancePasswordToggle`** (`@relements/core/behaviors/password-toggle`) — a
  show/hide button (`data-re-password-toggle`) that flips a password field's
  `type`, reflects `aria-pressed`, swaps its label, and preserves the caret.
- **`enhanceNumberStepper`** (`@relements/core/behaviors/number-stepper`) —
  large ± buttons over a native `<input type="number">` (`data-re-number`) that
  call `stepUp()`/`stepDown()`, re-dispatch `input`/`change`, and disable at the
  min/max bound. The input stays the native spinbutton.

All degrade to working native controls without JavaScript.
