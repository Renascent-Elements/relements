# Framework examples

The same one-flow built in five stacks, each consuming **only** the published
`@relements/core` API — no framework-specific wrappers.

Every example renders:

- a `<button class="re-button">` — the **CSS class** surface;
- a tabs region enhanced by `enhanceTabs()` — the **behavior** surface
  (`re-change` event, `.destroy()` teardown);
- a `<re-tabs>` custom element whose `re-change` event updates an `<output>` —
  the **custom-element + event** surface.

The DOM, class names, `--re-*` tokens, and `re-change` event contract are identical
across all five. Only the framework glue differs.

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
