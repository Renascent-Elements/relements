<p align="center">
  <img src="./.github/assets/relements-logo.png" alt="Relements" width="128" height="128" />
</p>

# Relements

A small, framework-neutral design system by [Renascent Elements](https://renascentelements.hu).

**Docs:** https://renascent-elements.github.io/relements/

## Packages

| Package                              | Version                                                                                               | Description                                             |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| [`@relements/core`](./packages/core) | [![npm](https://img.shields.io/npm/v/@relements/core)](https://www.npmjs.com/package/@relements/core) | Tokens, component styles, JS behaviors, custom elements |

## Principles

- **HTML first** — semantic HTML + CSS is the baseline; JavaScript is progressive enhancement
- **CSS before JavaScript** — visual states are CSS; behavior is layered on top
- **Framework-neutral** — the public API is HTML attributes, CSS classes, and DOM events
- **Accessible by default** — native elements, ARIA patterns, keyboard navigation
- **Small surface** — one CSS file for consumers with no build step required

## Browser support

Modern evergreen browsers, in two tiers — a broad HTML + CSS baseline plus progressively-enhanced features that degrade gracefully. CI runs the full suite on Chromium, Firefox, and WebKit. See [docs/BROWSER_SUPPORT.md](./docs/BROWSER_SUPPORT.md).

## Repository structure

```
packages/
  core/               @relements/core — the published package
    src/
      tokens.css      Design tokens (--re-* custom properties)
      reset.css       Minimal cross-browser normalization
      base.css        Document-level defaults
      components/     Button, form, dialog, disclosure, tabs, …
      behaviors/      enhanceTabs, showToast, enhanceDialog, …
      elements/       <re-tabs>, <re-toast>, <re-menu>, <re-popover>, <re-file-picker>, <re-tags-input>
      themes/         renascent.css — brand dark theme
docs/
  examples/           Plain HTML example pages (served at localhost:4173; also the Playwright fixtures)
  public/             Documentation site (@relements/docs) — Astro + Starlight, deployed to GitHub Pages
tests/
  elements/           Playwright behavior tests
  a11y/               axe-core accessibility tests
  visual/             Screenshot regression tests
  unit/               Vitest unit tests
```

## Development

```bash
pnpm install
pnpm exec playwright install chromium firefox webkit   # the browser suite runs on all three

pnpm test                    # full suite (unit + browser + a11y + visual)
pnpm run lint                # Prettier + ESLint
pnpm build                   # produce packages/core/dist/
```

Serve the HTML examples:

```bash
pnpm exec http-server . -p 4173 -c-1
# open http://localhost:4173/docs/examples/
```

Run the documentation site:

```bash
pnpm -F @relements/core build      # the site consumes the built core
pnpm -F @relements/docs dev        # open http://localhost:4321/relements/
```

The site is built and deployed to GitHub Pages by `.github/workflows/docs.yml` on push to `main`.

## Releasing

Releases are automated with [Changesets](https://github.com/changesets/changesets) and GitHub Actions — no manual `npm publish`.

1. In your PR, add a changeset describing the change:
   ```bash
   pnpm changeset
   ```
2. Merge the PR to `main`. The release workflow opens (or updates) a **"version packages"** PR that bumps the version and updates the changelog.
3. Merge that PR. The workflow builds `dist/` in CI and publishes `@relements/core` to npm via [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers) (OIDC) with SLSA provenance.

See `.github/workflows/release.yml`.

## Versioning

Relements follows semantic versioning. The public API surface and what counts as a breaking change are defined in [docs/VERSIONING.md](./docs/VERSIONING.md).

## License

MIT — [Renascent Elements](https://renascentelements.hu)
