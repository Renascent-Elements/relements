---
"@relements/core": patch
---

`enhanceCommandPalette`: the global hotkey now claims its combo. When the configured `data-re-command-hotkey` matches it also `stopPropagation()`s, so the keystroke doesn't bubble to a page-level `⌘K` search bound on `window`/`document` (e.g. a docs-site search) and open two things at once. The palette listens on `document`, which runs before any `window` listener in the bubble phase, so it reliably wins.
