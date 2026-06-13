---
"@relements/core": minor
---

Add the form-focused Tier-2 batch:

- **Rating** (`.re-rating`) — a star rating on a native radio `<fieldset>`:
  keyboard, single-select, and form value with no JavaScript. The chosen star
  and all lower ones fill via floor-safe sibling selectors; `direction: rtl`
  aligns the visual order (1→5). `.re-rating-display` renders a read-only
  fractional average (`role="img"` + `--re-rating-value`). Optional
  `enhanceRating` normalizes arrow-key direction across browsers.
- **OTP input** (`.re-otp` in `.re-otp-field`) — a single native one-time-code
  input styled segmented, so native paste, SMS autofill, and submission keep
  working. Optional `enhanceOtp` (`@relements/core/behaviors/otp`) adds an
  active-cell hook and opt-in digit filtering without splitting the field.
- **`enhanceTagsInput`** (`@relements/core/behaviors/tags-input`) — turns a
  plain `.re-input` into a token editor: chips reuse `.re-tag`, Enter/comma
  commit, Backspace removes the last, with `data-re-tags-max` and
  case-insensitive de-duplication. Each tag is backed by a hidden input so the
  form submits an array; with no JavaScript it degrades to a comma-separated
  text field.
