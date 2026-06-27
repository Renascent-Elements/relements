# Framework examples

The same one-flow built in five stacks, each consuming **only** the published
`@relements/core` API — no framework-specific wrappers.

Every example renders:

- a `<button class="re-button">` — the **CSS class** surface;
- a tabs region enhanced by `enhanceTabs()` — the **behavior** surface
  (`re-change` event, `.destroy()` teardown);
- a `<re-tabs>` custom element whose `re-change` event updates an `<output>` —
  the **custom-element + event** surface;
- a multi-select enhanced by `enhanceMultiSelect()` — the **DOM-injecting
  behavior** surface: it appends a live region via `host.after()`, rides the
  native `change` event, survives an in-place re-render, and tears down on
  unmount.

The DOM, class names, `--re-*` tokens, and `re-change` event contract are identical
across all five. Only the framework glue differs.

Browse all five side by side: open [`_index.html`](./_index.html) (after
`pnpm build:examples`).

## Try online (no install)

Each app opens in a live editor straight from this repo — the matching framework
doc page (`docs/public/.../frameworks/<fw>.md`) carries the one-click buttons:

| App     | StackBlitz                                                                                              | CodeSandbox                                                                                               |
| ------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| react   | <https://stackblitz.com/github/Renascent-Elements/relements/tree/main/docs/examples/frameworks/react>   | <https://codesandbox.io/s/github/Renascent-Elements/relements/tree/main/docs/examples/frameworks/react>   |
| vue     | <https://stackblitz.com/github/Renascent-Elements/relements/tree/main/docs/examples/frameworks/vue>     | <https://codesandbox.io/s/github/Renascent-Elements/relements/tree/main/docs/examples/frameworks/vue>     |
| svelte  | <https://stackblitz.com/github/Renascent-Elements/relements/tree/main/docs/examples/frameworks/svelte>  | <https://codesandbox.io/s/github/Renascent-Elements/relements/tree/main/docs/examples/frameworks/svelte>  |
| angular | <https://stackblitz.com/github/Renascent-Elements/relements/tree/main/docs/examples/frameworks/angular> | <https://codesandbox.io/s/github/Renascent-Elements/relements/tree/main/docs/examples/frameworks/angular> |

These work because each app declares `"@relements/core": "*"` — so opened standalone
(no monorepo), the editor installs the **published** package from npm. Inside this
repo, the root `.npmrc` sets `link-workspace-packages=true`, so the same `"*"` instead
**links the local `packages/core`** — local dev, CI, and the e2e tests all exercise the
in-repo source, not the published build.

## Run a single app

```bash
pnpm -F @relements/core build      # the apps consume core's dist/
cd docs/examples/frameworks/react  # or vue / svelte / angular
pnpm install
pnpm dev
```

The `html/` example needs no build — serve the repo root and open
`docs/examples/frameworks/html/index.html`.

## Build all examples (what CI does)

```bash
pnpm build:examples
```

Outputs each app to `docs/examples/frameworks/<fw>/dist/` (gitignored).

## Test

```bash
pnpm build:examples
pnpm exec playwright test tests/frameworks
```

## Per-framework caveats

| Framework | Custom element                          | Custom event (`re-change`)                                       |
| --------- | --------------------------------------- | ---------------------------------------------------------------- |
| HTML      | works as-is                             | `addEventListener('re-change', …)`                               |
| React     | renders as-is (React 19)                | no `onReChange` prop — `ref` + `addEventListener` in `useEffect` |
| Vue       | needs `isCustomElement` compiler option | `@re-change` binds the native event                              |
| Svelte    | works as-is                             | `onre-change={…}` (event attrs are case-sensitive)               |
| Angular   | needs `CUSTOM_ELEMENTS_SCHEMA`          | `(re-change)="…($event)"`                                        |

See each app's own README for details.

**DOM-injecting behaviors** (e.g. `enhanceMultiSelect`, which appends its live
region as a sibling via `host.after()`): give the host a **single-child wrapper**
element and enhance the wrapper — the injected node then lands inside a container
the framework treats as opaque, so it survives re-renders (rather than being
reconciled away from between vdom siblings). `destroy()` removes it on unmount.
