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
  string attributes through, so the light-DOM markup just works. Register the
  element with the bare side-effect import
  `import "@relements/core/elements/re-tabs";` — `@relements/core` marks its
  element modules as side-effectful in `sideEffects`, so the self-registering
  `customElements.define` survives bundler tree-shaking.
- **Teardown demo:** the "Toggle tabs" button conditionally renders the `<Tabs>`
  child, demonstrating the documented teardown — unmounting runs the `useEffect`
  cleanup (`controller.destroy()` + `removeEventListener`), and remounting
  re-initializes a fresh instance.
