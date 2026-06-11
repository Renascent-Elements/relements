# @relements/core

## 0.7.0

### Minor Changes

- [#33](https://github.com/Renascent-Elements/relements/pull/33) [`07f77c5`](https://github.com/Renascent-Elements/relements/commit/07f77c5e4018285a0d58b2cfd69686adb507a68e) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add three HTML-first components: **slider** (`.re-slider` on a native range
  input with `data-size` variants), **tooltip** (CSS-only `.re-tooltip` wrapper +
  `.re-tooltip__bubble` revealed on hover/focus, `data-placement="top|bottom|start|end"`,
  force-show via `data-open`), and **combobox** (`.re-combobox` additive to
  `.re-input` for `<input list>` + `<datalist>` suggestion inputs).

## 0.6.0

### Minor Changes

- [#30](https://github.com/Renascent-Elements/relements/pull/30) [`9298740`](https://github.com/Renascent-Elements/relements/commit/9298740fc7ebbe700590497248a23be47b03cada) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add separator, kbd, and code components. Pure-CSS enhancements over the native
  `<hr>`, `<kbd>`, and `<pre>`/`<figure>` base styles: a `.re-separator` with a
  vertical orientation for toolbars, a raised `.re-kbd` key cap, and a bordered
  `.re-code` block with an optional `<figcaption>` filename.

## 0.5.0

### Minor Changes

- [#27](https://github.com/Renascent-Elements/relements/pull/27) [`6dc222d`](https://github.com/Renascent-Elements/relements/commit/6dc222d7166451e41f6f9c34177475230906124f) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Add four HTML-first, CSS-only components: `table` (with zebra/hover/density/sticky-header
  `data-*` options), `skeleton` (reduced-motion-safe shimmer), `spinner` (accessible busy
  indicator), and `pagination` (native links, `aria-current`/`aria-disabled`).

### Patch Changes

- [#28](https://github.com/Renascent-Elements/relements/pull/28) [`8e9893f`](https://github.com/Renascent-Elements/relements/commit/8e9893f61fb26fb5b9402001546f7bbb5aca84f2) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Align the scoped Renascent theme's `--re-color-accent-500` tint with the global
  dark ramp (`#60a5fa`). Previously `.theme-renascent` / `.theme-renascent-dark`
  used `#3c83f6` for the 500 step while the global `:root` dark used `#60a5fa`, so
  the accent tint differed depending on how the theme was applied. No change to
  button/link colors (600/700 unchanged).

## 0.4.1

### Patch Changes

- [#25](https://github.com/Renascent-Elements/relements/pull/25) [`749ca66`](https://github.com/Renascent-Elements/relements/commit/749ca66f54156a2eeffb3d05cc3503ec2785aa2b) Thanks [@cstuncsik](https://github.com/cstuncsik)! - Fix WCAG AA contrast for primary buttons in the global dark Renascent theme.

  The dark theme's button base (`--re-color-accent-600`) was the brand `#3c83f6`,
  on which white button text is only ~3.6:1 (below AA). It now uses `#2563eb`
  (white 5.17:1), matching the light theme and the `.theme-renascent-dark` class —
  so dark primary/danger buttons are accessible regardless of how the theme is
  applied. `#3c83f6` remains the brand tint/gradient color.

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
