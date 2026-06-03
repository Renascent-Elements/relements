# @relements/core

## 0.2.0

### Minor Changes

- [#18](https://github.com/Renascent-Elements/relements/pull/18) [`a76a6f2`](https://github.com/Renascent-Elements/relements/commit/a76a6f263715d306d3cb6c6c231f9496cf4f42e5) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add eight components: **alert**, **badge**, **card**, **tag**, **avatar**, **breadcrumb**, **accordion**, and **switch**.

  All are pure CSS in the `re.components` cascade layer with per-component CSS exports (`@relements/core/components/<name>.css`). Alert and Tag reuse the existing `enhanceDismissible` behavior for dismissal; Accordion uses the native `<details name>` attribute for single-open exclusivity (no JavaScript), degrading to independent disclosures on older browsers; Switch is a styled `<input type="checkbox" role="switch">`.

  Also adds status-surface design tokens (`--re-color-{info,success,warning,danger}-surface/-border/-text`) with dark-scheme overrides.

## 0.1.3

### Patch Changes

- [#14](https://github.com/Renascent-Elements/relements/pull/14) [`567a5f0`](https://github.com/Renascent-Elements/relements/commit/567a5f0147ae1dd88c870523c2baedcf2c505e5a) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Fix custom-element registration and framework interop, and add framework usage examples.
  - Mark element modules as side-effectful so the documented `import "@relements/core/elements/re-tabs"` side-effect import is no longer tree-shaken away by bundlers (Vite/Rollup/webpack).
  - `<re-tabs>` now enhances light-DOM children that are projected after the host connects (e.g. Angular), and re-enhances idempotently if the host is moved/reconnected.
  - Add minimal usage examples for plain HTML, React, Vue, Svelte, and Angular under `docs/examples/frameworks/`, each consuming the published CSS/behavior/custom-element API with no framework wrappers.

## 0.1.2

### Patch Changes

- [#10](https://github.com/Renascent-Elements/relements/pull/10) [`8e1aa85`](https://github.com/Renascent-Elements/relements/commit/8e1aa8534c79bf2a9cd19ccabfabc85d68533fe2) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Set up CI (lint, unit, e2e) and Changesets-driven npm release with provenance.
