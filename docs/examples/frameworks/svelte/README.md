# Svelte example

```bash
pnpm -F @relements/core build
pnpm install
pnpm dev      # or: pnpm build
```

## Caveats

- **Custom elements:** `<re-tabs>` renders as-is; Svelte does not validate unknown
  tag names.
- **Custom events:** in Svelte 5 any `on`-prefixed attribute is a listener and
  event names are case-sensitive, so `onre-change={onChange}` listens for the
  `re-change` `CustomEvent`. Read `event.detail.tabId`.
- **Behavior lifecycle:** run `enhanceTabs(node)` in `onMount` and return
  `() => controller.destroy()` for teardown.
