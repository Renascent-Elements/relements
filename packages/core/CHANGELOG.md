# @relements/core

## 0.4.0

### Minor Changes

- [#23](https://github.com/Renascent-Elements/relements/pull/23) [`b461310`](https://github.com/Renascent-Elements/relements/commit/b46131080c342774ee8f21bf2a549f224b4dec37) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Expose the Renascent theme's per-scheme palette as `--re-rn-light-*` /
  `--re-rn-dark-*` custom properties.

  `themes/renascent.css` now defines its light and dark brand palettes as
  always-available custom properties (backgrounds, text, borders, links,
  selection, focus, status surfaces, and the interactive accent steps), and
  references them internally. Consumers that drive theming with their own
  mechanism (e.g. a `data-theme` attribute) can map these vars to `--re-color-*`
  without duplicating the brand values. No visual change to the theme itself.

## 0.3.0

### Minor Changes

- [#21](https://github.com/Renascent-Elements/relements/pull/21) [`eecc90e`](https://github.com/Renascent-Elements/relements/commit/eecc90ea4cc1f1f481904396d07a68b6bbad429d) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add a light variant to the Renascent Elements theme.

  `themes/renascent.css` now follows `prefers-color-scheme`: brand dark on dark
  systems, brand light on light systems. The new `.theme-renascent-light` and
  `.theme-renascent-dark` classes force a scheme regardless of the OS.

  **Behavior change:** the theme was previously always dark. Add the
  `.theme-renascent-dark` class to a container (or `:root`) to keep forced-dark
  behavior.

  **Accessibility:** fixed WCAG AA contrast in the theme — buttons now use white
  text on accent/danger fills (was dark text), and status surfaces (alert tints)
  now render correctly in dark scope. These adjust the dark theme's button text
  and alert colors slightly.

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
