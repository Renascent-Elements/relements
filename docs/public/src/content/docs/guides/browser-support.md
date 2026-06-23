---
title: Browser support
description: Supported browsers and the two-tier baseline.
---

Relements targets modern evergreen browsers. Support is **two-tier**, matching the HTML-first philosophy (see the [HTML-first policy](/relements/guides/html-first/)): a broad semantic HTML + CSS baseline, plus progressive enhancements that need recent engines and degrade gracefully where they are unavailable.

## Tier 1 — Baseline (HTML + CSS)

Semantic markup, design tokens, and component styles. The practical floor is **cascade layers** (`@layer`), which the stylesheet relies on.

| Engine        | Minimum |
| ------------- | ------- |
| Chrome / Edge | 99+     |
| Firefox       | 97+     |
| Safari        | 15.4+   |

_(Roughly early 2022.)_ Below this, layered styles will not apply correctly. This tier also uses logical properties and native `<dialog>` styling, which are supported earlier than the floor above.

## Tier 2 — Full enhanced experience

Some components use the newest platform features:

- **Popover API** — `<re-popover>`, `enhancePopover`. Chrome 114+, Firefox 125+, Safari 17+.
- **`:user-invalid` validation styling** — form fields. Chrome 118+, Firefox 116+, Safari 16.4+.
- **`color-mix()`** — popover tonal backgrounds. Chrome 111+, Firefox 113+, Safari 16.4+.

| Engine        | Minimum |
| ------------- | ------- |
| Chrome / Edge | 118+    |
| Firefox       | 125+    |
| Safari        | 17+     |

_(Roughly late 2023.)_

## Graceful degradation

Below Tier 2, the affected pieces fall back rather than break — the rest of the system (Tier 1) keeps working:

- `<re-popover>` / `enhancePopover` **no-op** when the Popover API is absent (feature-detected); the markup stays valid.
- Form validation styling falls back from `:user-invalid` to `[aria-invalid="true"]`.
- `color-mix()` surfaces fall back to their base token color.
- The native `<dialog>` backdrop blur (`backdrop-filter`) is cosmetic; without it the backdrop is a solid scrim.

## What we test

Every pull request runs the full suite — behavior, accessibility (axe), and visual regression — on **Chromium, Firefox, and WebKit** via Playwright (the current stable builds Playwright bundles). This is the actively verified guarantee; the version tables above document intent.

## Not supported

- Internet Explorer.
- Non-evergreen or end-of-life browsers below the Tier 1 floor.

## Related

- [HTML-first policy](/relements/guides/html-first/) — the graceful-degradation ethos.
- [Versioning](/relements/guides/versioning/) — dropping a supported tier is a breaking change.
