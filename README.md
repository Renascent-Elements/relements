# Relements

A small, framework-neutral design system by [Renascent Elements](https://renascentelements.hu).

## Packages

| Package | Version | Description |
|---|---|---|
| [`@relements/core`](./packages/core) | 0.1.1 | Tokens, component styles, JS behaviors, custom elements |

## Principles

- **HTML first** — semantic HTML + CSS is the baseline; JavaScript is progressive enhancement
- **CSS before JavaScript** — visual states are CSS; behavior is layered on top
- **Framework-neutral** — the public API is HTML attributes, CSS classes, and DOM events
- **Accessible by default** — native elements, ARIA patterns, keyboard navigation
- **Small surface** — one CSS file for consumers with no build step required

## Repository structure

```
packages/
  core/               @relements/core — the published package
    src/
      tokens.css      Design tokens (--re-* custom properties)
      reset.css       Minimal cross-browser normalization
      base.css        Document-level defaults
      components/     Button, form, dialog, disclosure, tabs, …
      behaviors/      enhanceTabs, showToast, enhanceDialog, …
      elements/       <re-tabs>, <re-toast>, <re-menu>, <re-popover>
      themes/         renascent.css — brand dark theme
docs/
  examples/           Plain HTML example pages (served at localhost:4173)
tests/
  elements/           Playwright behavior tests
  a11y/               axe-core accessibility tests
  visual/             Screenshot regression tests
  unit/               Vitest unit tests
```

## Development

```bash
pnpm install
pnpm exec playwright install chromium

pnpm test                    # full suite (unit + browser + a11y + visual)
pnpm run lint                # Prettier + ESLint
pnpm build                   # produce packages/core/dist/
```

Serve the HTML examples:

```bash
pnpm exec http-server . -p 4173 -c-1
# open http://localhost:4173/docs/examples/
```

## Publishing

```bash
pnpm --filter @relements/core publish
```

`prepublishOnly` builds `dist/` automatically before the package goes out.

## License

MIT — [Renascent Elements](https://renascentelements.hu)
