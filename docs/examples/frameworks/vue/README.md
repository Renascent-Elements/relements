# Vue example

```bash
pnpm -F @relements/core build
pnpm install
pnpm dev      # or: pnpm build
```

## Caveats

- **Custom elements:** set `compilerOptions.isCustomElement: (tag) => tag.startsWith('re-')`
  in `@vitejs/plugin-vue` so Vue treats `<re-tabs>` as a DOM element instead of
  trying to resolve a component.
- **Custom events:** `@re-change="onChange"` binds the native `re-change`
  `CustomEvent`; read `event.detail.tabId`.
- **Behavior lifecycle:** run `enhanceTabs(ref)` in `onMounted` and call
  `controller.destroy()` in `onUnmounted`.
- **Teardown demo:** the "Toggle demo" button toggles the `<Tabs>` and `<Multiselect>` children with
  `v-if`, demonstrating teardown — `onUnmounted` runs `controller.destroy()`, and
  remounting re-runs `onMounted` to re-initialize a fresh instance.
