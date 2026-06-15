---
"@relements/core": major
---

**Relements 1.0.0 — first stable release.** 🎉

The API is now stable and versioned under semver. From here, the public surface — the `.re-*` classes, `data-*` attributes, `--re-*` tokens, the `enhance*(root) → { destroy() }` behavior contract, the `re-*` custom events, and the `<re-*>` custom elements — only changes in a backward-compatible way within 1.x; breaking changes wait for 2.0. See the [versioning policy](https://renascent-elements.github.io/relements/guides/versioning/).

There are **no new breaking changes in 1.0.0** — upgrading from the latest `0.x` is a drop-in. This release marks the point where the surface is considered finished and stable, capping the pre-1.0 hardening:

- **Breadth** — 44 components, 17 progressive-enhancement behaviors, and 4 light-DOM custom elements, every one HTML-first (works with zero JavaScript) and framework-agnostic.
- **A normalized API** — semantic color is `data-tone` everywhere (structural variation stays `data-variant`); one canonical spelling per token; uniform `data-size` / `data-orientation` scales and `enhance*` signatures.
- **Conformance** — automatic `prefers-color-scheme` dark mode, dark visual baselines on the token-risky components, and a Windows High Contrast / `forced-colors` policy (restored focus outlines + system-color state cues) — all regression-tested.
- **Documentation** — a generated, drift-guarded [token reference](https://renascent-elements.github.io/relements/guides/tokens/); dark-mode, accessibility, theming, and behaviors guides; a `CONTRIBUTING` guide; and a keyboard/accessibility section on every component page.
- **Quality** — behavior, axe-accessibility, and cross-platform visual-regression tests for every component on Chromium, Firefox, and WebKit, published via npm Trusted Publishing with provenance.

Thank you for using Relements.
