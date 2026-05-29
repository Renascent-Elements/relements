# React example

```bash
pnpm -F @relements/core build
pnpm install
pnpm dev      # or: pnpm build
```

## Caveats

- **Custom events:** React provides no `onReChange` prop for the `re-change`
  `CustomEvent`. Get a `ref` to the `<re-tabs>` element and
  `addEventListener('re-change', …)` inside `useEffect`, returning the
  `removeEventListener` for cleanup.
- **Behavior lifecycle:** call `enhanceTabs(ref.current)` in `useEffect` and
  return `controller.destroy()` so it tears down on unmount (and on every
  `StrictMode` remount in development).
- **Custom elements:** React 19 renders unknown tags like `<re-tabs>` and passes
  string attributes through, so the light-DOM markup just works.
- **Element registration + tree-shaking:** a bare `import "@relements/core/elements/re-tabs"`
  gets dropped by bundler tree-shaking, because the package marks its JS as
  side-effect-free (`sideEffects` lists only CSS). The self-registering
  `customElements.define` then never runs and `<re-tabs>` stays an inert
  `HTMLElement`. Import the class instead and register it explicitly:

  ```js
  import { ReTabsElement } from "@relements/core/elements/re-tabs";
  if (!customElements.get("re-tabs")) {
    customElements.define("re-tabs", ReTabsElement);
  }
  ```
