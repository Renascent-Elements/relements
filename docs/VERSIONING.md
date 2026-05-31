# Versioning

Relements follows [Semantic Versioning](https://semver.org) (`MAJOR.MINOR.PATCH`). This document defines the **public API surface** the contract applies to and what counts as a breaking change. It is the authoritative policy; the summary in `TECHNICAL_DOCUMENTATION.md` points here.

## Public API surface

Versioning guarantees apply to the documented public surface (see "Public API Conventions" in `TECHNICAL_DOCUMENTATION.md`):

- **CSS classes** — `re-*` (e.g. `re-button`, `re-field`).
- **Data attributes** — documented `data-variant`, `data-size`, `data-state`, … and `data-re-*` enhancement hooks.
- **CSS custom properties** — `--re-*` design tokens and documented component-level properties.
- **JavaScript exports** — named exports and the package subpath entry points (`@relements/core/...`).
- **Custom elements** — `<re-*>` tag names, their attributes, and emitted events.
- **Documented HTML markup shape** — the structure components require to work.
- **Rendered appearance** — the default visual output of components (see [Visual changes](#visual-changes)).

Anything not documented as public — internal class names, source layout, implementation details, generated/hashed names — is **not** part of the contract and may change in any release.

## Change classification

### Major (breaking)

- Removing or renaming any public CSS class, token, data attribute, JS export, subpath, or custom element tag / attribute / event.
- Changing documented DOM structure requirements or default behavior.
- **Material visual or layout changes** — a restyle that perceptibly changes appearance, spacing, or layout (see below).
- Dropping a supported browser tier (see `BROWSER_SUPPORT.md`).
- Removing a previously deprecated feature.

### Minor

- New components, custom elements, behaviors, or tokens.
- New optional attributes or variants.
- Additive, non-material visual additions (a new variant that leaves existing defaults untouched).
- Deprecating a feature without removing it.

### Patch

- Bug fixes that preserve the public API and appearance.
- Internal refactors.
- Imperceptible / sub-threshold visual fixes.
- Documentation.

## Visual changes

Because consumers depend on the rendered look of components, **material visual changes are breaking**:

- A change that _intentionally_ updates the visual-regression baselines in a user-perceptible way (beyond the `maxDiffPixelRatio` noise threshold) is a **major** change.
- Cosmetic fixes below the perceptual threshold (anti-aliasing, sub-pixel shifts) are **patch**.
- A new variant that leaves existing defaults untouched is **minor**.

When in doubt, treat a deliberate restyle as breaking.

## Deprecation policy

- Mark the feature deprecated in its docs and the CHANGELOG, with the recommended replacement.
- Keep it working for at least **one minor release** before removal.
- Remove only in a major release.

## Pre-release checklist

- Behavior, accessibility (axe), and visual tests green on **Chromium, Firefox, and WebKit**.
- Docs updated (including `BROWSER_SUPPORT.md` if support changed).
- A changeset added, at the bump level this policy dictates.

## Release mechanics

Releases are automated with [Changesets](https://github.com/changesets/changesets) — see the **Releasing** section of the README. Add a changeset (`pnpm changeset`) choosing the bump level per this policy; merging to `main` opens a version PR; merging that publishes to npm.

> The move to **1.0.0** is itself a deliberate `major` changeset, made once the 1.0 readiness items are complete. Until then the package is `0.x`, where the API may still change between minor releases.
