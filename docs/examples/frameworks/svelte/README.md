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
- **Mount/unmount:** the "Toggle demo" button demonstrates teardown — `onMount`'s
  returned teardown runs `controller.destroy()` on unmount; remount re-runs `onMount`.
- **A11y advisories:** Svelte's compiler emits `a11y_no_noninteractive_element_to_interactive_role`
  warnings for the `role="tabpanel"` on each `<section>` in the standard WAI-ARIA tabs
  markup. These are false positives for the tabs pattern and do not affect runtime;
  suppress them by placing `<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->`
  above each `<section role="tabpanel">` if you want a clean build.
