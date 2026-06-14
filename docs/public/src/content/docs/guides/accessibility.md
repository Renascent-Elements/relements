---
title: Accessibility
description: How Relements approaches accessibility — native semantics first, visible focus, forced-colors support, and honest ARIA stances.
---

Accessibility in Relements starts from the platform. Because the system is [HTML-first](/relements/guides/html-first/), most accessibility comes for free: keyboard interaction, focus management, and the accessibility tree are the browser's, not a re-implementation we have to keep correct. JavaScript only enhances; it is never required for a component to be operable.

This page is a 1.0 statement of intent and an honest map of what is and is not covered. It is **not** a formal WCAG audit or a VPAT.

## Native semantics first

Components are built on the closest native element — `<button>`, `<a href>`, `<dialog>`, `<details>`/`<summary>`, `<input>`, `<ol>`, `<nav>` — so keyboard operability, focus order, and assistive-technology exposure are inherited from the browser rather than rebuilt in script. The [reset](/relements/guides/theming/) is deliberately minimal and keeps native semantics intact; CSS styles those native elements, and the optional `enhance*` behaviors layer on richer interaction (roving tabindex, type-to-filter, anchored positioning) without taking over the base. A component that works with plain HTML works with a screen reader and a keyboard before a single line of JavaScript runs.

## Visible focus

`base.css` gives every interactive element a `:focus-visible` ring driven by the `--re-shadow-focus` token — a two-part `box-shadow` (an offset gap in the background color plus the ring color) so the indicator reads against any surface:

```css
:focus-visible {
  outline: none;
  box-shadow: var(--re-shadow-focus);
  border-radius: var(--re-radius-sm);
}
```

Because `box-shadow` can't be clipped to a single edge, components that live in tight or scrolled containers — the [menu](/relements/components/menu-button/) (and the [context menu](/relements/components/context-menu/) and [command palette](/relements/components/command-palette/) that reuse it), the [tree](/relements/components/tree/), and the [steps](/relements/components/steps/) marker — opt out of the outer ring and use an **inset** ring instead (`box-shadow: inset 0 0 0 2px var(--re-color-focus-ring)`), which never gets cut off by `overflow`. Outer-ring components like [banner](/relements/components/banner/) keep the standard ring because their padding gives the ring room to breathe.

You retheme the ring by redeclaring the focus tokens — `--re-color-focus-ring`, `--re-focus-ring-width`, `--re-focus-ring-offset`, or the whole `--re-shadow-focus` (see [Theming & tokens](/relements/guides/theming/)).

## Forced colors (Windows High Contrast)

Windows High Contrast Mode / `forced-colors` strips `box-shadow` and flattens author backgrounds, which would silently erase every focus ring and every "this one is selected" cue. Relements restores both.

A single rule in `base.css` re-establishes a real focus indicator for **all** focusable elements as an `outline` in the `Highlight` system color. It uses `!important` so it beats the components that opted into `outline: none` for their inset rings:

```css
@media (forced-colors: active) {
  :focus-visible {
    outline: 2px solid Highlight !important;
    outline-offset: 1px;
  }
}
```

On top of that, components that signal state purely with a background or fill re-assert that state with system colors (`Highlight` / `HighlightText`, and `Canvas` / `CanvasText` for the stepper) inside their own `@media (forced-colors: active)` blocks. Covered today:

- [Pagination](/relements/components/pagination/) — the `aria-current="page"` item.
- [Tabs](/relements/components/tabs/) — the selected tab's underline indicator.
- [Toolbar](/relements/components/toolbar/) — `aria-pressed` toggles (including while hovered, so the cue doesn't flicker away under the pointer).
- [Combobox](/relements/components/combobox/) and [command palette](/relements/components/command-palette/) — the active/selected listbox row.
- [Switch](/relements/components/switch/), checkbox, and radio ([form controls](/relements/components/checkbox/)) — the checked fill (and the indeterminate checkbox).
- [Segmented](/relements/components/segmented/) — the checked option.
- [Rating](/relements/components/rating/) — filled stars, plus a real outline on the visible star (the radio is `sr-only`, so the global ring would land on a 1px clipped box).
- [Steps](/relements/components/steps/) — marker borders, the current step's `Highlight` ring, and the connector segments.
- [Tree](/relements/components/tree/) — the `aria-current` leaf.

## Dark mode, contrast, and reduced motion

**Dark mode** is automatic. `tokens.css` remaps the role tokens under `@media (prefers-color-scheme: dark)`, including the focus ring (it drops the offset gap that would otherwise read as two separate lines on a near-black background). See the [Dark mode](/relements/guides/dark-mode/) guide.

**Contrast.** Solid status fills (the `data-emphasis="solid"` [banner](/relements/components/banner/), and the same approach in alerts/badges) use the `*-700` color step paired with `--re-color-text-on-accent`, not `-600` — `-600` on white lands around 3.2–3.8:1 and fails WCAG AA for text, whereas every `-700` shade clears AA (accent 6.6, danger 6.5, success 5.5, warning 5.0). Dismiss controls inherit that already-verified foreground rather than a translucent mix that would drop below 4.5:1.

**Reduced motion.** `reset.css` honors `prefers-reduced-motion: reduce` globally — animations and transitions are collapsed to ~0ms and `scroll-behavior` is forced to `auto` — so the whole system quiets down for users who ask for it:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Honest ARIA stances

We do not claim ARIA widget roles we can't back with the full keyboard model. Adding a role without its expected interactions would mislead assistive technology, so a few components are deliberately _less_ ARIA-decorated than they might first appear:

- **[Tree](/relements/components/tree/) is navigation, not `role="tree"`.** It's a styled nested-disclosure tree built from native `<nav>` + nested `<details>`/`<summary>` with `<a href>` / `<button>` leaves. Expand/collapse, focus order, and Enter/Space activation are all native and need zero JavaScript. It intentionally does **not** claim `role="tree"`, because the tree widget keyboard model (Up/Down between items, Right/Left to expand, etc.) is out of scope — claiming the role without the model would mislead AT.
- **[Steps](/relements/components/steps/) is a display indicator, not a tablist.** It's an ordered process indicator on a native `<ol>`. There is no roving tabindex, no `role="tab"`, and no panels. The markers are decorative (`aria-hidden`), so completion is exposed to AT with a visually-hidden status word per step plus `aria-current="step"` on the current `<li>`.

## `aria-current`, `role="list"`, and `.re-sr-only`

- **`aria-current`** marks the active item in navigation-style components: `page` on the current [breadcrumb](/relements/components/breadcrumb/) crumb, [pagination](/relements/components/pagination/) page, and `<a href>` [tree](/relements/components/tree/) leaf; `step` on the current [steps](/relements/components/steps/) item; `true` on a `<button>` tree leaf.
- **`role="list"` on unordered nav lists.** [Tree](/relements/components/tree/) puts `role="list"` on every `<ul>` so Safari/VoiceOver keep announcing "list, N items" even though `list-style: none` would otherwise drop list semantics. Ordered lists are treated differently: [steps](/relements/components/steps/) and [breadcrumb](/relements/components/breadcrumb/) strip the list visually in CSS and **keep native `<ol>` ordered semantics** rather than adding `role="list"`, which would downgrade the `<ol>` to a generic list and kill the "N of M" position read.
- **`.re-sr-only`** is the shared visually-hidden utility (in `base.css`) for text that should reach screen readers but not the screen — per-star rating labels, the [tags-input](/relements/components/tags-input/) live region, and the steps status words all use it.

## Testing

Every component ships an **axe** accessibility spec (`tests/a11y/<name>.a11y.spec.ts`), run on Chromium, Firefox, and WebKit on every pull request alongside behavior and visual-regression tests (see [Browser support](/relements/guides/browser-support/)). A dedicated **forced-colors** suite (`tests/a11y/forced-colors.spec.ts`) emulates High Contrast Mode and asserts that the focus outline survives, that the inset-ring opt-outs still show an outline, and that selected/current/checked/pressed state is re-established with system colors. Forced-colors emulation is Chromium-only.

These checks catch a wide class of regressions, but they are automated tests — **not a substitute for a formal WCAG conformance audit, manual screen-reader testing across the matrix, or a published VPAT.** Treat this guide as a statement of design intent and verified coverage, not a certification.

## Related

- [HTML-first policy](/relements/guides/html-first/) — why native semantics come first.
- [Theming & tokens](/relements/guides/theming/) — the focus-ring and color tokens you can override.
- [Dark mode](/relements/guides/dark-mode/) — automatic `prefers-color-scheme` support.
- [Browser support](/relements/guides/browser-support/) — what we test and where.
