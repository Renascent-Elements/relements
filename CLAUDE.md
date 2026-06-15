# Relements — agent guide

HTML-first, framework-agnostic design system. Published to npm as a **single package** `@relements/core` (not per-element — subpath exports give granularity). pnpm monorepo.

## Core philosophy

- **Native HTML first, enhanced progressively.** Style native elements with `.re-*` classes + `data-*` attributes. JavaScript is optional `enhance*` behaviors and a few `<re-*>` custom elements — never required for base functionality. See `docs/HTML_FIRST_POLICY.md`.
- **No wrappers.** The same class/attribute/event API works in React, Vue, Svelte, Angular, and plain HTML.

## Layout

- `packages/core/` — the published package. CSS in `src/components/*.css`, behaviors in `src/behaviors/*.js`, custom elements in `src/elements/*.js`. Built to `dist/` (gitignored) via lightningcss (CSS) + tsup (JS + d.ts).
- `docs/examples/*.html` — plain-HTML example pages. **These double as the Playwright fixture corpus** (the test suite navigates to them) AND as the docs-site demo source. Don't treat them as throwaway.
- `docs/examples/frameworks/*` — per-framework example apps (Vite).
- `docs/public/` — the documentation site (Astro + Starlight) → GitHub Pages. Private workspace package `@relements/docs`.
- `docs/*.md` — product/technical/testing docs (source of truth for guides).

## Commands

- Build core: `pnpm build` (or `pnpm -F @relements/core build`). Always build core before the docs site or examples that consume `dist/`.
- Tests: `pnpm test` (unit + browser). `pnpm test:unit` (Vitest, `tests/unit/**/*.spec.ts`). `pnpm test:browser` (Playwright). `pnpm build:examples` first if running browser tests manually.
- Lint/format: `pnpm lint` (`prettier --check . && eslint . && stylelint`), `pnpm format`. `pnpm lint:css` runs Stylelint alone. Stylelint (`stylelint.config.mjs`) enforces the CSS-authoring conventions below on component CSS — tokens-only colors, logical properties, and the browser floor (`lh`/`:dir()` banned); intentional exceptions carry a `/* stylelint-disable-… -- reason */`.
- Docs site: `pnpm -F @relements/docs dev | build | preview`.
- Release: `pnpm changeset` per change; merge → Changesets opens a version PR → publishes on merge (npm Trusted Publishing, Node 24).

## CSS cascade layers (important)

Order: `@layer re.tokens, re.reset, re.base, re.components;`. Component styles live in the low-priority `re.components` layer **on purpose** — consumer overrides land in the unlayered cascade and win automatically. Subtree theming = redeclare token custom properties on any ancestor. Consequence: any unlayered third-party CSS (e.g. a host framework's) will beat Relements styles — isolate when embedding (see docs site below).

## CSS authoring (the non-obvious parts)

- **Browser floor: Chrome 99 / Firefox 97 / Safari 15.4.** Safe above the floor (use freely): `color-mix()`, `:has()`, the Popover API, anchor positioning, `<details name>` (exclusive accordion). **Above the floor — avoid:** the `lh` unit and `:dir()` (both Safari 16.4+). Center against line boxes with `calc(… - 1em * var(--re-line-height-normal))`; target RTL with `[dir="rtl"]` ancestor/self selectors, not `:dir()`.
- **Tokens only.** Every value is a `--re-*` custom property; the only allowed literals are tiny structural ones (`1px`/`2px` borders, `0`, a `ch` measure). Seed geometry from real tokens (e.g. a marker diameter from `--re-control-height-*`), never a magic rem. Use logical properties (`padding-inline`, `inset-inline-start`, `inline-size`, `border-inline-*`) so RTL is free.
- **Dark-mode trap:** `--re-color-bg-subtle` collapses to `surface` in dark and vanishes against cards — use `--re-color-bg-muted` (or a `color-mix` on `currentColor`) for hover/raised states. Capture a real dark **and a hovered** state in a visual baseline so this can't regress silently.
- **Focus ring:** `base.css` gives a global `:focus-visible` **outer** ring (`box-shadow: var(--re-shadow-focus)`). Opt out to an **inset** ring (`box-shadow: inset 0 0 0 2px var(--re-color-focus-ring)`) only for tight/scrolled containers (menu, tree, command-palette, horizontal steps), where an outer ring clips at the edge and dark's ring-offset→0 swallows it. Padded rows (alert/toast/banner dismiss) keep the outer ring.
- **Forced colors (Windows High Contrast):** the UA strips `box-shadow` (so every box-shadow focus ring vanishes) and flattens `background-color`/`color` to system colors (so state shown only by background/colour is lost). `base.css` restores a global `@media (forced-colors: active) { :focus-visible { outline: 2px solid Highlight !important } }` (`!important` beats the inset-ring opt-outs across `@layer`s). Any component conveying persistent selected/current/checked/pressed/active state via background or colour re-establishes it in a `@media (forced-colors: active)` block with system colors — `Highlight` fill + `HighlightText` foreground (or `Highlight` text where the glyph is colour-only, e.g. rating). Test it with `page.emulateMedia({ forcedColors: "active" })` (Chromium only — the `test.use({ forcedColors })` context option is a no-op in our Playwright); assert against the resolved `Highlight` value, not a hardcoded colour.
- **Solid status fills that carry TEXT need AA contrast.** White-on-`*-600` is fine for _bars_ (progress/meter — no text) but fails 4.5:1 as text; use the `*-700` scale + `--re-color-text-on-accent` when text/icon sits on a solid status fill. Don't use a translucent `color-mix` for a control's visible glyph (the `×`) — it can drop below AA; full `currentColor` inherits the (already AA-verified) container foreground.
- **`base.css` sets `color` directly on some elements** (`p`, headings, …), which **blocks inheritance** from a colored component container. A `<p>` message inside a tinted/solid banner needs explicit `color: inherit` to pick up the band foreground.
- **List semantics differ by list type.** A `<ul>` nav list gets `role="list"` (restores "list, N items" in Safari VoiceOver under `list-style: none`). An **ordered** `<ol>` (stepper) must **not** — `role="list"` downgrades it to a generic list and drops the "N of M" position that's the whole point; strip the list visually in CSS instead (`list-style/margin/padding: 0`, like breadcrumb).
- Be honest in code comments and docs about what reaches assistive tech: an `aria-hidden` glyph conveys nothing to AT, and status carried only by color/glyph is a WCAG 1.3.1 gap — back it with a real cue (`.re-sr-only` text, `aria-current`, a forced-colors `Highlight` ring).

## Testing conventions

- Playwright `baseURL` is `http://localhost:4173/docs/examples/` (served by the config's webServer — `http-server` at the repo root). Behavior specs: `tests/elements/<name>.spec.ts`; a11y: `tests/a11y/<name>.a11y.spec.ts`; visual: `tests/visual/<name>.visual.spec.ts`.
- Example pages link **raw `src/index.css`**, so CSS edits show up in the browser/visual tests with no rebuild (only `dist`-consuming surfaces — the docs site, the unit `exports` test — need `pnpm build` first).
- Visual baselines: commit **both** `-darwin` and `-linux` PNGs. Generate the Linux baselines via the `update-snapshots` GitHub Action — **not** local Docker (it renders differently from the CI runner).
- Regenerate baselines with `--update-snapshots all` (what `pnpm test:update-snapshots` runs). Plain `--update-snapshots` is `changed` mode: a sub-`maxDiffPixelRatio` change still **passes**, so it leaves the baseline depicting the OLD render — stale-but-green. Use `all` to force the refresh.
- a11y specs assert `results.violations` is empty — but axe **can't** catch presentation-only state (e.g. status conveyed by an `aria-hidden` glyph) and parks short decorative glyphs (a lone `×`) in `results.incomplete`, not `violations`. Don't let "axe clean" stand in for real semantics; verify the AT story yourself.
- Per-component checklist: see "Acceptance per element" in `docs/PROGRESS.md` (example with demo delimiters, behavior + axe + visual tests, docs page, changeset).

## Docs site (`docs/public`)

- **Single-sourced live demos:** each demo's markup exists once, inside `docs/examples/*.html`, wrapped in inert `<!-- demo:start name="X" -->` … `<!-- demo:end -->` comments (region name = the section's `data-testid`). The `<Demo src="<file>.html" name="X" />` component (`src/components/Demo.astro`) extracts the region via `import.meta.glob(... ?raw)`, renders it live, and shows the same string as code. Site and tested behavior can't drift. To add a component page: add delimiters in the example page + create `src/content/docs/components/<name>.mdx`.
- **Interactive demos** are driven by a global client init (`src/client/enhance.ts`, loaded from the `Head` override) because `set:html` doesn't run inline scripts. Custom elements self-register on import; `enhance*` functions scan `document`. So a demo is only interactive on the site if it works **declaratively**: use the library's `data-re-*` attributes (e.g. dialog uses `data-re-dialog-trigger`/`-target`/`-close` so global `enhanceDialog` wires it — inert on the example page, which has its own script). For genuinely imperative APIs with no declarative form (`showToast`), the demo buttons carry a docs-only `data-demo-toast` hook that `enhance.ts` reads — and the page also shows the real `showToast(...)` call. Don't rely on a demo's inline `<script>` running on the site; it won't.
- **Isolation:** `.demo__preview` carries Starlight's `not-content` class so Starlight's markdown-content styles (which are unlayered and would beat Relements' layered CSS — e.g. a stray `details` border) don't leak into demos. Starlight's own `@layer` rules are a second hazard: its layers are declared after Relements' in the bundle, so `starlight.*` outranks `re.*` everywhere — notably `starlight.reset`'s `input, button, textarea, select { font: inherit }` kills component font sizing/weight in demos. site.css carries an unlayered, demo-scoped counter-reset block; extend it when a new component sets font properties on those elements.
- **Dev server:** `vite.server.fs.allow` must be the monorepo root (`["../.."]`) so dev can serve `docs/examples` raw imports and hoisted root deps. Don't `import` from `vite` in `astro.config.mjs` — it isn't a direct dep of `docs/public` under pnpm.
- **Deploy:** `.github/workflows/docs.yml` builds core then the site → GitHub Pages. One-time manual repo setting: **Settings → Pages → Source = GitHub Actions**.

## Conventions

- pnpm workspace; devDeps (Playwright, Vitest, Prettier, ESLint) live at the root.
- `dist/` is gitignored — built at publish time and in CI.
- Prettier style: double quotes, 2-space, semicolons, trailing commas. `.astro` files are covered by `prettier-plugin-astro` + `eslint-plugin-astro`.
- Squash merges on `main` — after a merge, branch fresh from `origin/main` to avoid diff noise.
- **Keep `packages/core/README.md` in sync.** It's the npm-facing surface — when you add or change a component, behavior, or custom element, update its row in the README's component tables / behaviors / elements lists in the same PR (alongside the changeset and the docs `.mdx`).
