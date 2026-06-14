# Contributing to Relements

Thanks for helping build Relements — an HTML-first, framework-agnostic design system published to npm as a single package, [`@relements/core`](https://www.npmjs.com/package/@relements/core).

Before you start, skim two documents that this guide leans on:

- [`CLAUDE.md`](./CLAUDE.md) — the canonical engineering notes (CSS authoring rules, cascade layers, testing and docs-site gotchas).
- [`docs/PROGRESS.md`](./docs/PROGRESS.md) — the per-component acceptance checklist.

The guiding philosophy is **native HTML first, enhanced progressively**: style native elements with `.re-*` classes and `data-*` attributes; JavaScript (`enhance*` behaviors and a few `<re-*>` custom elements) is always optional. See the [HTML-first policy](https://renascent-elements.github.io/relements/guides/html-first/).

## Setup

This is a [pnpm](https://pnpm.io) monorepo. All shared devDependencies (Playwright, Vitest, Prettier, ESLint, lightningcss, tsup) live at the **root** — there is one install.

```bash
pnpm install
pnpm exec playwright install chromium firefox webkit   # the browser suite runs on all three
```

Requirements (from the root `package.json` `engines`): **Node >= 20**, **pnpm >= 10**.

### Key commands

Run these from the repo root.

| Command               | What it does                                                         |
| --------------------- | -------------------------------------------------------------------- |
| `pnpm build`          | Build `@relements/core` to `dist/` (lightningcss CSS + tsup JS/d.ts) |
| `pnpm test`           | Full suite: unit, then browser (`test:unit` + `test:browser`)        |
| `pnpm test:unit`      | Vitest only (`tests/unit/**/*.spec.ts`)                              |
| `pnpm test:browser`   | Playwright only (behavior + a11y + visual)                           |
| `pnpm build:examples` | Build core, then the per-framework example apps                      |
| `pnpm lint`           | `prettier --check .` then `eslint .`                                 |
| `pnpm format`         | `prettier --write .`                                                 |
| `pnpm changeset`      | Author a changeset for your change (see [Releasing](#releasing))     |

Notes:

- **`dist/` is gitignored** — it is built at publish time and in CI, never committed.
- The HTML example pages link the **raw** `packages/core/src/index.css`, so CSS edits show up in the browser/visual tests with **no rebuild**. Only `dist`-consuming surfaces need `pnpm build` first: the docs site and the unit `exports` test.
- Run `pnpm build:examples` before running the Playwright suite manually.

## Repo layout

```
packages/core/        The published package — @relements/core
  src/
    tokens.css, reset.css, base.css, index.css   CSS foundation + cascade-layer entry
    components/*.css   per-component styles (re.components layer)
    behaviors/*.js     optional enhance* progressive enhancement
    elements/*.js      <re-*> custom elements (light-DOM only)
    themes/            renascent.css — brand dark theme
docs/
  examples/*.html      Plain-HTML example pages — the Playwright fixture corpus AND the
                       docs-site live-demo source. Not throwaway: edit them carefully.
  examples/frameworks/ per-framework example apps (Vite)
  public/              The documentation site (@relements/docs) — Astro + Starlight → GitHub Pages
  *.md                 product/technical/testing docs (source of truth for the guides)
tests/
  unit/                Vitest unit tests
  elements/            Playwright behavior tests
  a11y/                axe-core accessibility tests
  visual/              screenshot regression tests
```

`docs/examples/*.html` is doing double duty — the test suite navigates to those pages, and the docs site extracts demo regions from them. A change to an example page is a change to both.

## Adding or changing a component

Every component is checked off only when all of the boxes below are done. This mirrors **"Acceptance per element"** in [`docs/PROGRESS.md`](./docs/PROGRESS.md).

1. **CSS / JS / element source** in `packages/core/src/{components,behaviors,elements}/`. Component CSS lives in the low-priority `re.components` cascade layer and is **tokens-only** (see [Conventions](#conventions-css-authoring)).
2. **Wire it into the entry + exports:**
   - add the `@import` to `packages/core/src/index.css`, and
   - add the `package.json` subpath export(s), and
   - the existence checks in `tests/unit/exports.spec.ts` cover the new `dist` file(s), so keep that list current.
3. **Example page** at `docs/examples/<element>.html`, with each demo region wrapped in `<!-- demo:start name="X" -->` … `<!-- demo:end -->` delimiters (the region name is the section's `data-testid`).
4. **Tests** — all three:
   - behavior: `tests/elements/<name>.spec.ts`
   - accessibility: `tests/a11y/<name>.a11y.spec.ts` (axe; `results.violations` must be empty)
   - visual: `tests/visual/<name>.visual.spec.ts` (see [Visual baselines](#visual-baselines))
5. **Docs page** at `docs/public/src/content/docs/components/<name>.mdx`, using the `<Demo src="<file>.html" name="X" />` component so the rendered demo and shown code can't drift from the tested markup. The Starlight sidebar auto-generates, so a new file just appears.
6. **Keep [`packages/core/README.md`](./packages/core/README.md) in sync** — it is the npm-facing surface. Update the relevant component/behavior/element row in the same PR.
7. **Add a changeset** (`pnpm changeset`) at the bump level the [versioning policy](https://renascent-elements.github.io/relements/guides/versioning/) dictates.
8. **`pnpm test` green**, then land an atomic commit.

> A docs-site demo is only interactive if it works **declaratively** — through the library's `data-re-*` attributes that the global client init (`docs/public/src/client/enhance.ts`) wires up. Inline `<script>` in an example page runs on the example page but **not** on the docs site. See the "Docs site" section of [`CLAUDE.md`](./CLAUDE.md).

## Conventions (CSS authoring)

Full detail lives in the **"CSS authoring"** section of [`CLAUDE.md`](./CLAUDE.md). The headline rules:

- **Tokens only.** Every value is a `--re-*` custom property; the only allowed literals are tiny structural ones (`1px`/`2px` borders, `0`, a `ch` measure). Seed geometry from real tokens, never a magic rem.
- **Logical properties for free RTL** — `padding-inline`, `inset-inline-start`, `inline-size`, `border-inline-*`. Target RTL with `[dir="rtl"]` selectors, not `:dir()` (Safari 16.4+, above our floor).
- **Browser floor: Chrome 99 / Firefox 97 / Safari 15.4.** Safe above the floor (use freely): `color-mix()`, `:has()`, the Popover API, anchor positioning, `<details name>`. Above the floor and to be avoided: the `lh` unit and `:dir()`. See [Browser support](https://renascent-elements.github.io/relements/guides/browser-support/).
- **Focus ring.** `base.css` provides a global `:focus-visible` **outer** ring; opt out to an **inset** ring only for tight/scrolled containers (menu, tree, command-palette, horizontal steps).
- **Dark mode.** `--re-color-bg-subtle` collapses to `surface` in dark — use `--re-color-bg-muted` for hover/raised states. Capture a real dark **and** a hovered state in a visual baseline.
- **Forced colors (Windows High Contrast).** The UA strips `box-shadow` and flattens colors. `base.css` restores the focus outline globally; any component conveying persistent selected/current/checked/pressed state via background or color must re-establish it in a `@media (forced-colors: active)` block with system colors (`Highlight` / `HighlightText`).
- **Cascade layers** matter — component styles sit in `re.components` on purpose so consumer (unlayered) overrides win automatically. Order is `@layer re.tokens, re.reset, re.base, re.components;`. See [Theming & tokens](https://renascent-elements.github.io/relements/guides/theming/).

### Prettier / code style

Double quotes, 2-space indent, semicolons, trailing commas. `.astro` files are covered by `prettier-plugin-astro` + `eslint-plugin-astro`. Run `pnpm format` before committing and `pnpm lint` to verify.

## Testing

`pnpm test` runs Vitest unit tests and then the Playwright browser suite (behavior + a11y + visual) on **Chromium, Firefox, and WebKit**. Playwright's `baseURL` is `http://localhost:4173/docs/examples/`, served by the config's `webServer`.

- **Behavior** specs: `tests/elements/<name>.spec.ts`.
- **Accessibility** specs: `tests/a11y/<name>.a11y.spec.ts` — assert `results.violations` is empty. Note axe can't catch presentation-only state (e.g. status carried by an `aria-hidden` glyph); verify the assistive-tech story yourself, don't let "axe clean" stand in for real semantics.
- **Visual** specs: `tests/visual/<name>.visual.spec.ts`.

### Visual baselines

- Commit **both** the `-darwin` **and** `-linux` PNG baselines for every snapshot.
- Generate the **Linux** baselines via the **`update-snapshots` GitHub Action** (`.github/workflows/update-snapshots.yml`, run via _workflow_dispatch_) — **not** local Docker, which renders differently from the CI runner. The action uploads the regenerated `*-linux.png` files as a build artifact for you to commit.
- Regenerate with `--update-snapshots all` (i.e. `pnpm test:update-snapshots`). Plain `--update-snapshots` runs in `changed` mode, where a sub-`maxDiffPixelRatio` change still _passes_ and leaves the baseline depicting the OLD render — stale-but-green. Use `all` to force the refresh.

## Releasing

Releases are automated with [Changesets](https://github.com/changesets/changesets) and GitHub Actions — there is **no manual `npm publish`**.

1. In your PR, add a changeset describing the change at the correct bump level:
   ```bash
   pnpm changeset
   ```
2. Merge the PR to `main`. The release workflow opens (or updates) a **"version packages"** PR that bumps the version and updates the changelog.
3. Merge that PR. CI builds `dist/` and publishes `@relements/core` to npm via npm Trusted Publishing (OIDC) with provenance.

Pick the bump level per the [versioning policy](https://renascent-elements.github.io/relements/guides/versioning/): material visual/layout changes and any removal/rename of a public class, token, attribute, export, or element are **breaking**.

## Git workflow

- **Squash merges** land on `main`. After a merge, branch **fresh from `origin/main`** to avoid carrying stale diff noise into your next change.
- Keep commits atomic — one self-contained change per commit, with its tests and changeset.

## Questions

Open an [issue](https://github.com/Renascent-Elements/relements/issues) or start a discussion. Thanks for contributing!
