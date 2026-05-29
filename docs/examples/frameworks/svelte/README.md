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
- **A11y advisories:** Svelte's compiler emits `a11y_no_noninteractive_element_to_interactive_role`
  warnings for the standard WAI-ARIA tabs markup (`role="tab"` on `<button>`,
  `role="tablist"` on `<div>`). These are false positives for the tabs pattern and do
  not affect runtime; suppress per-element with `<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->`
  if you want a clean build.
