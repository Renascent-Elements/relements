# Angular example

```bash
pnpm -F @relements/core build
pnpm install
pnpm dev      # or: pnpm build
```

## Caveats

- **Custom elements:** add `CUSTOM_ELEMENTS_SCHEMA` to the component's `schemas`
  so Angular allows `<re-tabs>` in the template.
- **Custom events:** `(re-change)="onChange($event)"` binds the native
  `re-change` `CustomEvent`; cast `$event` to `CustomEvent` to read
  `detail.tabId`.
- **Behavior lifecycle:** run `enhanceTabs(el.nativeElement)` in `ngOnInit` and
  call `controller.destroy()` in `ngOnDestroy`.
- **Mount/unmount:** the "Toggle demo" button demonstrates teardown — `@if`
  removing `<app-tabs>` + `<app-multiselect>` runs `ngOnDestroy` (`controller.destroy()`); re-adding
  runs `ngOnInit`.
- **Global CSS:** import `@relements/core/index.css` from `src/styles.css`.
