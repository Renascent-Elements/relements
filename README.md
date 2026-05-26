# Relements

Relements is a small, framework-neutral design system by Renascent Elements.

It starts with semantic HTML, adds CSS tokens and component styles, and uses JavaScript only where progressive enhancement is needed.

The baseline usage path is plain HTML plus CSS. Framework integrations should remain thin wrappers over the same HTML, class, attribute, token, and event API.

## Principles

- HTML first
- CSS before JavaScript
- Framework-neutral by default
- Small public API
- Accessible native behavior
- Progressive enhancement

## Planned Usage

```html
<link rel="stylesheet" href="/relements/index.css" />

<button class="re-button" data-variant="primary">Save</button>
```

```js
import "@relements/core/index.css";
import { enhanceTabs } from "@relements/core/tabs";
```

## Documentation

- [Product requirements](./docs/PRODUCT_REQUIREMENTS.md)
- [Technical documentation](./docs/TECHNICAL_DOCUMENTATION.md)
- [Implementation plan](./docs/IMPLEMENTATION_PLAN.md)
- [Testing strategy](./docs/TESTING_STRATEGY.md)
- [HTML-first policy](./docs/HTML_FIRST_POLICY.md)

## Status

Relements is in the planning and foundation phase.
