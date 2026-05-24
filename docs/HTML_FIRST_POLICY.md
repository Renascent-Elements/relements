# HTML-First Policy

## Purpose

Relements must remain usable with plain HTML and CSS as a first-class integration path.

This is the core compatibility guarantee of the project. A consumer should be able to use the basic design system in any web project by writing semantic HTML and loading CSS. JavaScript, custom elements, and framework wrappers are progressive layers, not requirements for the foundation.

## Compatibility Guarantee

The baseline Relements experience must work with:

- Plain HTML files.
- Server-rendered templates.
- Static site generators.
- CMS-rendered markup.
- React.
- Vue.
- Svelte.
- Angular.
- Any framework that can render HTML classes and attributes.

The canonical API is the browser API:

- HTML elements.
- Native HTML attributes.
- CSS classes.
- CSS custom properties.
- `data-*` attributes.
- ESM JavaScript modules where behavior is needed.
- DOM events where interaction needs to be observed.

Framework-specific APIs must never become the source of truth.

## Layer Order

Every feature should follow this order:

1. **HTML**
   Start with the closest native semantic element.

2. **CSS**
   Add styling, tokens, variants, layout, and visual states.

3. **JavaScript**
   Add behavior only when native HTML and CSS are not enough.

4. **Custom Element**
   Add a custom element only when a reusable framework-neutral component boundary is valuable.

5. **Framework Wrapper**
   Add thin wrappers only after the platform API is stable.

## CSS-Only Consumption

Consumers must be able to use the foundation like this:

```html
<link rel="stylesheet" href="/relements/index.css">

<button class="re-button" data-variant="primary">
  Save
</button>
```

This usage must not require:

- JavaScript.
- A bundler.
- A frontend framework.
- A compiler.
- Hydration.
- Runtime registration.

## JavaScript Enhancement Rules

JavaScript should enhance existing markup:

```html
<div class="re-tabs" data-re-tabs>
  ...
</div>
```

```js
import { enhanceTabs } from "@relements/core/tabs";

const controller = enhanceTabs(document);
```

Enhancers must:

- Accept a root node.
- Return a cleanup API.
- Avoid framework assumptions.
- Preserve understandable markup before enhancement.
- Use native events or documented `CustomEvent` APIs.

## Framework Wrapper Rules

Framework wrappers are optional adapters.

They may provide:

- TypeScript ergonomics.
- Event binding convenience.
- Framework lifecycle integration.
- Familiar import paths for framework users.

They must not:

- Replace the HTML/CSS API.
- Introduce behavior that does not exist in the core package.
- Require consumers to use a wrapper for basic components.
- Hide native HTML attributes without a strong reason.
- Become the only documented usage path.

Canonical usage should always remain valid:

```jsx
<button className="re-button" data-variant="primary">
  Save
</button>
```

Wrappers should stay thin:

```jsx
<Button variant="primary">Save</Button>
```

The wrapper should render the same platform-level contract:

```html
<button class="re-button" data-variant="primary">
  Save
</button>
```

## Component Acceptance Rule

A component cannot be considered complete unless it documents and tests the lowest viable layer:

- HTML-only if possible.
- HTML plus CSS for visual styling.
- HTML plus CSS plus JavaScript for enhanced behavior.
- Custom element only when justified.
- Framework wrapper only after the core API is stable.

## Non-Negotiables

- Basic styles must work with plain HTML.
- Native controls must stay native unless replacement is justified.
- CSS classes and custom properties are public API.
- JavaScript must be optional for static and form-oriented primitives.
- Framework support must build on the platform API, not fork it.
