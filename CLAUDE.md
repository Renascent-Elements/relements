# Relements — agent guide

HTML-first, framework-agnostic design system. Published to npm as a **single package** `@relements/core` (not per-element — subpath exports give granularity). pnpm monorepo.

## Core philosophy

- **Native HTML first, enhanced progressively.** Style native elements with `.re-*` classes + `data-*` attributes. JavaScript is optional `enhance*` behaviors and a few `<re-*>` custom elements — never required for base functionality. See `docs/HTML_FIRST_POLICY.md`.
- **No wrappers.** The same class/attribute/event API works in React, Vue, Svelte, Angular, and plain HTML.

## Layout

- `packages/core/` — the published package. CSS in `src/components/*.css`, behaviors in `src/behaviors/*.js`, custom elements in `src/elements/*.js`. Built to `dist/` (gitignored) via lightningcss (CSS) + tsup (JS + d.ts).
- `docs/examples/*.html` — plain-HTML example pages. **These double as the Playwright fixture corpus** (the test suite navigates to them) AND as the docs-site demo source. Don't treat them as throwaway.
- `docs/examples/frameworks/*` — per-framework example apps (Vite).
- `docs/web/` — the documentation site (Astro + Starlight) → GitHub Pages. Private workspace package `@relements/web`.
- `docs/*.md` — product/technical/testing docs (source of truth for guides).

## Commands

- Build core: `pnpm build` (or `pnpm -F @relements/core build`). Always build core before the docs site or examples that consume `dist/`.
- Tests: `pnpm test` (unit + browser). `pnpm test:unit` (Vitest, `tests/unit/**/*.spec.ts`). `pnpm test:browser` (Playwright). `pnpm build:examples` first if running browser tests manually.
- Lint/format: `pnpm lint` (`prettier --check . && eslint .`), `pnpm format`.
- Docs site: `pnpm -F @relements/web dev | build | preview`.
- Release: `pnpm changeset` per change; merge → Changesets opens a version PR → publishes on merge (npm Trusted Publishing, Node 24).

## CSS cascade layers (important)

Order: `@layer re.tokens, re.reset, re.base, re.components;`. Component styles live in the low-priority `re.components` layer **on purpose** — consumer overrides land in the unlayered cascade and win automatically. Subtree theming = redeclare token custom properties on any ancestor. Consequence: any unlayered third-party CSS (e.g. a host framework's) will beat Relements styles — isolate when embedding (see docs site below).

## Testing conventions

- Playwright `baseURL` is `http://localhost:4173/docs/examples/` (served by the config's webServer). Behavior specs: `tests/elements/<name>.spec.ts`; a11y: `tests/a11y/<name>.a11y.spec.ts`; visual: `tests/visual/<name>.visual.spec.ts`.
- Visual baselines: commit **both** `-darwin` and `-linux` PNGs. Generate the Linux baselines via the `update-snapshots` GitHub Action — **not** local Docker (it renders differently from the CI runner).
- Known flaky: `tests/elements/toast.spec.ts › duration auto-dismisses` (timing race under parallel load; passes single-worker). Unrelated to most changes.

## Docs site (`docs/web`)

- **Single-sourced live demos:** each demo's markup exists once, inside `docs/examples/*.html`, wrapped in inert `<!-- demo:start name="X" -->` … `<!-- demo:end -->` comments (region name = the section's `data-testid`). The `<Demo src="<file>.html" name="X" />` component (`src/components/Demo.astro`) extracts the region via `import.meta.glob(... ?raw)`, renders it live, and shows the same string as code. Site and tested behavior can't drift. To add a component page: add delimiters in the example page + create `src/content/docs/components/<name>.mdx`.
- **Interactive demos** are driven by a global client init (`src/client/enhance.ts`, loaded from the `Head` override) because `set:html` doesn't run inline scripts. Custom elements self-register on import; `enhance*` functions scan `document`. So a demo is only interactive on the site if it works **declaratively**: use the library's `data-re-*` attributes (e.g. dialog uses `data-re-dialog-trigger`/`-target`/`-close` so global `enhanceDialog` wires it — inert on the example page, which has its own script). For genuinely imperative APIs with no declarative form (`showToast`), the demo buttons carry a docs-only `data-demo-toast` hook that `enhance.ts` reads — and the page also shows the real `showToast(...)` call. Don't rely on a demo's inline `<script>` running on the site; it won't.
- **Isolation:** `.demo__preview` carries Starlight's `not-content` class so Starlight's markdown-content styles (which are unlayered and would beat Relements' layered CSS — e.g. a stray `details` border) don't leak into demos.
- **Dev server:** `vite.server.fs.allow` must be the monorepo root (`["../.."]`) so dev can serve `docs/examples` raw imports and hoisted root deps. Don't `import` from `vite` in `astro.config.mjs` — it isn't a direct dep of `docs/web` under pnpm.
- **Deploy:** `.github/workflows/docs.yml` builds core then the site → GitHub Pages. One-time manual repo setting: **Settings → Pages → Source = GitHub Actions**.

## Conventions

- pnpm workspace; devDeps (Playwright, Vitest, Prettier, ESLint) live at the root.
- `dist/` is gitignored — built at publish time and in CI.
- Prettier style: double quotes, 2-space, semicolons, trailing commas. `.astro` files are covered by `prettier-plugin-astro` + `eslint-plugin-astro`.
- Squash merges on `main` — after a merge, branch fresh from `origin/main` to avoid diff noise.
