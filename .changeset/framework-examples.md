---
"@relements/core": patch
---

Fix custom-element registration and framework interop, and add framework usage examples.

- Mark element modules as side-effectful so the documented `import "@relements/core/elements/re-tabs"` side-effect import is no longer tree-shaken away by bundlers (Vite/Rollup/webpack).
- `<re-tabs>` now enhances light-DOM children that are projected after the host connects (e.g. Angular), and re-enhances idempotently if the host is moved/reconnected.
- Add minimal usage examples for plain HTML, React, Vue, Svelte, and Angular under `docs/examples/frameworks/`, each consuming the published CSS/behavior/custom-element API with no framework wrappers.
