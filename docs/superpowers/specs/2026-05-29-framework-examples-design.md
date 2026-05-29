# Phase 8 — Framework Examples

**Status:** Approved design
**Date:** 2026-05-29
**Scope:** `docs/examples/frameworks/` + `tests/frameworks/`

## Goal

Prove `@relements/core` is framework-neutral by building the **same one-flow** in five
stacks — plain HTML, React, Vue, Svelte, Angular — each consuming only the published
public API. No framework-specific wrappers. Document the per-framework caveats that
arise from consuming a vanilla DOM contract.

The published contract has three surfaces, and every example exercises all three:

1. **CSS** — class names (`re-button`, `re-tabs`, …) and `--re-*` custom properties.
2. **Behaviors** — imperative enhancers like `enhanceTabs(root) → { destroy() }` that
   dispatch bubbling, cancelable `CustomEvent`s (e.g. `re-change`).
3. **Custom elements** — `re-tabs`, `re-toast`, `re-menu`, `re-popover`, which emit the
   same `re-*` events.

Framework friction lives almost entirely in surfaces 2 and 3 (lifecycle and
custom-event binding); surface 1 is `className` everywhere. The flow is deliberately
chosen to hit all three.

## The canonical one-flow

Every example renders the identical page and produces comparable DOM output:

- **CSS surface** — a `<button class="re-button">Save</button>`. Class only, zero JS.
- **Behavior surface** — `enhanceTabs` mounted against the example's root on mount and
  torn down with `.destroy()` on unmount. Listens for the cancelable `re-change` event.
- **Custom-element surface** — a `<re-tabs>` instance bound to its `re-change`
  `CustomEvent`, reading `detail.tabId`.
- A single `<output id="last-tab">` echoes the last `tabId` seen. This is the shared
  assertion target for the smoke tests.

The tabs markup (roles, `aria-selected`, `aria-controls`, `hidden` panels) is identical
to the existing `docs/examples/tabs.html`, so the "same markup, same classes, same
events" claim is literal.

## Layout

```
docs/examples/frameworks/
  _index.html                          # links to all five; frames the comparison
  README.md                            # the thesis, the shared contract, run/test guide
  html/    index.html                  # no-build reference flow
  react/   package.json, vite.config, src/main.jsx, src/App.jsx, README.md
  vue/     package.json, vite.config, src/main.js,  src/App.vue,  README.md
  svelte/  package.json, vite.config, src/main.js,  src/App.svelte, README.md
  angular/ package.json, angular.json, src/main.ts, src/app/app.component.ts, README.md
```

Each framework app:

- Declares `"@relements/core": "workspace:*"` and imports through the package
  `exports` map (`@relements/core/index.css`, `@relements/core/behaviors/tabs`,
  `@relements/core/elements/re-tabs`). Examples consume the **published entry points**,
  not source paths — this is what validates the contract.
- Carries a short `README.md` documenting setup, the API usage, and the framework's
  caveat (below).

## Build & serve

Reuses the existing `http-server . -p 4173` infrastructure — no second server.

- Vite apps build with `base: './'`; Angular builds with a relative base href. Each
  produces static output under its own `dist/`.
- New workspace script **`build:examples`**: build `@relements/core` first (its
  `exports` resolve to `dist/`), then build all five example apps.
- The `e2e` script becomes `build:examples && playwright test`. Playwright still points
  at `http://localhost:4173/docs/examples/frameworks/<fw>/dist/`.
- The CI e2e job gains the `build:examples` step before running Playwright.
- Per-app `dist/` and `node_modules/` are **gitignored**; built on demand by CI and
  local Playwright runs. The `html/` example needs no build.
- Single-app local development still uses each app's own `pnpm dev`.

## Testing

One Playwright spec per framework under `tests/frameworks/`, every spec asserting the
same contract against that app's built output:

1. `.re-button` is visible (CSS surface).
2. `ArrowRight` on the tablist moves focus and flips `aria-selected` (behavior surface).
3. Activating a tab updates `<output id="last-tab">` from the `re-change`
   `detail.tabId` (event + element surface).

Shared assertions are factored into a helper (`tests/frameworks/_contract.ts`) so the
five specs stay near-identical. Any framework drifting from the contract fails its spec.

## Per-framework caveats

Documented in each app's `README.md`. Exact syntax is verified against current docs via
Context7 at implementation time (framework custom-element/event handling is
version-sensitive — notably React 19 and Svelte 5).

- **HTML** — the baseline. No caveats; `addEventListener('re-change', …)` and direct
  `enhanceTabs(document)`.
- **React** — custom events have no `onReChange` prop; bind with a `ref` +
  `addEventListener`. Run `enhanceTabs` in `useEffect` and return `destroy()` for
  cleanup. Note React 19's attribute/property behavior for custom elements.
- **Vue** — set `compilerOptions.isCustomElement` (via `@vitejs/plugin-vue`) so `re-*`
  tags aren't treated as components. `@re-change` binds the native `CustomEvent`. Behavior
  lifecycle via `onMounted` / `onUnmounted`.
- **Svelte** — lowest friction: `re-*` tags and `on:re-change` work directly. Behavior
  lifecycle via `onMount`'s returned teardown. Note Svelte 5 event syntax.
- **Angular** — add `CUSTOM_ELEMENTS_SCHEMA` so `re-*` tags are allowed in templates.
  `(re-change)` binds the native event. Behavior lifecycle via `ngOnInit` /
  `ngOnDestroy`.

## Changeset

A changeset is added (docs-facing entry) for changelog visibility, even though `docs/`
is not in the package `files` (`["dist", "src"]`) and the published npm artifact is
unchanged.

## Out of scope (YAGNI)

- Framework wrapper packages (deferred until the platform API is stable, per the
  implementation plan's Phase 8 acceptance criteria).
- SSR / hydration demonstrations.
- Component galleries (repetitive `className` showcases prove nothing the one-flow
  doesn't).
- Publishing the example apps to npm.

## Acceptance criteria (from `docs/IMPLEMENTATION_PLAN.md`)

- [ ] Same class and attribute API works across all five examples.
- [ ] Custom elements documented for each framework.
- [ ] Framework-specific caveats documented.
- [ ] No wrapper-only behavior introduced.
- [ ] Each example renders the canonical HTML, class, attribute, token, and event
      contract identically.
