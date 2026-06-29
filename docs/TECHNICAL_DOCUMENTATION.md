# Technical Documentation

## Overview

Relements is a framework-neutral frontend foundation built on standard browser APIs. Its core deliverables are CSS, semantic HTML conventions, and small JavaScript modules that progressively enhance markup.

The system should work in four usage modes:

1. Plain HTML with CSS only.
2. Plain HTML with optional JavaScript enhancements.
3. Framework templates using the same HTML, CSS, and attributes.
4. Optional custom elements for behavior-heavy components.

The canonical API is the platform API: HTML elements, native attributes, CSS classes, CSS custom properties, `data-*` attributes, ESM behavior modules, and DOM events. Framework wrappers are optional adapters and must not introduce a separate source of truth.

## Architecture

```txt
packages/
  core/
    src/
      tokens.css
      reset.css
      base.css
      components/
        button.css
        form.css
        dialog.css
      behaviors/
        tabs.js
        dismissible.js
        dialog.js
      elements/
        re-tabs.js
      index.css
      index.js

docs/
  index.html
  examples/
    button.html
    form.html
    dialog.html
    tabs.html
```

## Layer Model

The implementation is organized into four layers.

Layer order is mandatory:

1. HTML.
2. CSS.
3. JavaScript enhancement.
4. Custom element, only when justified.
5. Framework wrapper, only after the core API is stable.

### 1. HTML Layer

The HTML layer defines the semantic contract.

Examples:

```html
<button class="re-button">Save</button>

<label class="re-field">
  <span class="re-field__label">Email</span>
  <input class="re-input" type="email" name="email" autocomplete="email" />
</label>

<details class="re-disclosure">
  <summary>More options</summary>
  <p>Additional content.</p>
</details>
```

Rules:

- Prefer native elements.
- Preserve native attributes.
- Do not require JavaScript for static content.
- Use `data-*` attributes for variants and state hooks.
- Keep DOM structure shallow and documented.
- Treat the documented HTML shape as the compatibility contract.

### 2. CSS Layer

The CSS layer provides visual design, theming, responsive behavior, and state styling.

Recommended cascade order:

```css
@layer re.reset, re.tokens, re.base, re.components, re.utilities;
```

Guidelines:

- Keep selectors low-specificity.
- Prefer classes and attributes over complex descendant selectors.
- Use CSS custom properties for tokens and theming.
- Use media queries for user preferences.
- Use container queries for component-level responsiveness when needed.
- Avoid generated class names as public API.

### 3. JavaScript Enhancement Layer

The JavaScript layer adds behavior that HTML and CSS cannot fully provide.

Enhancers should be plain functions:

```js
export function enhanceTabs(root = document) {
  const instances = [...root.querySelectorAll("[data-re-tabs]")].map(setupTabs);

  return {
    destroy() {
      for (const instance of instances) {
        instance.destroy();
      }
    },
  };
}
```

Rules:

- JavaScript modules must be optional.
- Enhancers should accept a root node.
- Enhancers should return a cleanup API.
- Enhancers should not assume a framework lifecycle.
- Enhancers should avoid global mutable state except for registry-level concerns.

### 4. Custom Elements Layer

Custom elements are reserved for behavior-heavy primitives that benefit from a native component boundary.

Example:

```html
<re-tabs>
  <button slot="tab">Overview</button>
  <section slot="panel">Overview content</section>

  <button slot="tab">Settings</button>
  <section slot="panel">Settings content</section>
</re-tabs>
```

Rules:

- Use autonomous custom elements, such as `re-tabs`.
- Use dash-case tag names.
- Use attributes for primitive configuration.
- Use properties for complex runtime data.
- Emit `CustomEvent` for changes.
- Document Shadow DOM styling hooks if Shadow DOM is used.
- Do not wrap simple native controls without a clear benefit.

## Public API Conventions

### CSS Classes

Use a stable prefix:

```html
<button class="re-button">Save</button>
<input class="re-input" />
<div class="re-field">...</div>
```

Recommended naming:

- `re-button`
- `re-input`
- `re-select`
- `re-textarea`
- `re-field`
- `re-dialog`
- `re-tabs`

### Data Attributes

Use data attributes for variant and behavior hooks:

```html
<button class="re-button" data-variant="primary" data-size="sm">Save</button>

<div class="re-tabs" data-re-tabs>...</div>
```

Recommended attributes:

- `data-variant`
- `data-size`
- `data-state`
- `data-orientation`
- `data-disabled`
- `data-re-*` for JavaScript enhancement hooks

### CSS Custom Properties

Token naming should be predictable and grouped by purpose:

```css
:root {
  --re-color-bg: Canvas;
  --re-color-text: CanvasText;
  --re-color-accent: Highlight;
  --re-color-accent-text: HighlightText;

  --re-font-sans: system-ui, sans-serif;
  --re-font-mono: ui-monospace, monospace;

  --re-space-1: 0.25rem;
  --re-space-2: 0.5rem;
  --re-space-3: 0.75rem;
  --re-space-4: 1rem;

  --re-radius-1: 0.25rem;
  --re-radius-2: 0.5rem;

  --re-border-width: 1px;
  --re-focus-ring: 2px solid Highlight;
}
```

Component-specific custom properties may be exposed when useful:

```css
.re-button {
  --re-button-bg: ButtonFace;
  --re-button-text: ButtonText;
  --re-button-border: ButtonBorder;
}
```

### Events

Custom events should use a namespaced event name:

```js
element.dispatchEvent(
  new CustomEvent("re-change", {
    bubbles: true,
    composed: true,
    detail: {
      value,
    },
  }),
);
```

Rules:

- Events should bubble when useful to application code.
- Events from Shadow DOM components should use `composed: true` when they are part of the public API.
- Event `detail` should be documented.
- Native events should be preserved where possible.

## CSS File Structure

### `tokens.css`

Contains design tokens only.

Responsibilities:

- Color tokens
- Typography tokens
- Spacing tokens
- Radius tokens
- Border tokens
- Motion tokens
- Z-index tokens

### `reset.css`

Contains minimal normalization.

Responsibilities:

- Box sizing
- Reasonable form inheritance
- Media defaults
- Button/input font inheritance

Avoid large resets that erase useful native behavior.

### `base.css`

Contains document-level defaults.

Responsibilities:

- Body font
- Text color
- Background color
- Link defaults
- Focus defaults
- Selection styles

### Component CSS

Each component gets its own file.

Example:

```txt
components/
  button.css
  form.css
  dialog.css
```

Each component file should:

- Define only that component.
- Use documented classes and data attributes.
- Avoid reaching into unrelated components.
- Use tokens instead of hard-coded values where practical.

### `index.css`

Imports the full system in order:

```css
@layer re.reset, re.tokens, re.base, re.components, re.utilities;

@import "./tokens.css" layer(re.tokens);
@import "./reset.css" layer(re.reset);
@import "./base.css" layer(re.base);
@import "./components/button.css" layer(re.components);
@import "./components/form.css" layer(re.components);
@import "./components/dialog.css" layer(re.components);
```

## JavaScript Module Structure

### Behavior Modules

Behavior modules export enhancer functions:

```js
export function enhanceDismissible(root = document) {
  const controllers = [];

  for (const trigger of root.querySelectorAll("[data-re-dismiss]")) {
    const target = document.getElementById(trigger.dataset.dsDismiss);
    if (!target) continue;

    const onClick = () => (target.hidden = true);
    trigger.addEventListener("click", onClick);

    controllers.push(() => trigger.removeEventListener("click", onClick));
  }

  return {
    destroy() {
      for (const cleanup of controllers) cleanup();
    },
  };
}
```

### Entry Module

`index.js` should export modules without auto-initializing everything:

```js
export { enhanceDismissible } from "./behaviors/dismissible.js";
export { enhanceTabs } from "./behaviors/tabs.js";
export { enhanceDialog } from "./behaviors/dialog.js";
```

Auto-initialization may be provided as a separate optional file:

```js
import { enhanceDismissible, enhanceTabs } from "./index.js";

enhanceDismissible(document);
enhanceTabs(document);
```

## Component Authoring Decision Tree

Use this decision tree before building a component:

1. Can native HTML do it?
   Use native HTML.

2. Can CSS style the native element enough?
   Add a class and CSS.

3. Does the component need state coordination, keyboard behavior, or lifecycle?
   Add a JavaScript enhancer.

4. Does it need a reusable framework-neutral component boundary?
   Consider a custom element.

5. Does the custom element need internal DOM protection?
   Consider Shadow DOM and expose styling hooks.

## Initial Component Technical Notes

### Button

Canonical markup:

```html
<button class="re-button" data-variant="primary">Save</button>
<a class="re-button" data-variant="secondary" href="/settings">Settings</a>
```

Requirements:

- Support `button`, `a`, and submit buttons.
- Preserve disabled behavior for real buttons.
- Use `aria-disabled="true"` only for elements that do not support `disabled`.
- Support icons through normal inline content.

### Form Field

Canonical markup:

```html
<label class="re-field">
  <span class="re-field__label">Email</span>
  <input class="re-input" type="email" name="email" />
  <span class="re-field__hint">Use your work email.</span>
</label>
```

Requirements:

- Labels must be explicit or wrapping.
- Hints and errors should be associated with `aria-describedby` when needed.
- Invalid state should support native `:invalid` and explicit `aria-invalid`.

### Dialog

Canonical markup:

```html
<dialog class="re-dialog" id="confirm-dialog">
  <form method="dialog">
    <h2>Delete item?</h2>
    <p>This action cannot be undone.</p>
    <button value="cancel">Cancel</button>
    <button value="confirm" data-variant="danger">Delete</button>
  </form>
</dialog>
```

Requirements:

- Use native `dialog`.
- Provide helper JavaScript for opening and closing.
- Preserve `method="dialog"` support.
- Avoid custom modal implementations in the first release.

### Tabs

Baseline markup may be readable sections.

Enhanced markup:

```html
<div class="re-tabs" data-re-tabs>
  <div role="tablist" aria-label="Account sections">
    <button role="tab" aria-selected="true" aria-controls="panel-profile" id="tab-profile">
      Profile
    </button>
    <button role="tab" aria-selected="false" aria-controls="panel-security" id="tab-security">
      Security
    </button>
  </div>

  <section role="tabpanel" id="panel-profile" aria-labelledby="tab-profile">
    Profile content
  </section>
  <section role="tabpanel" id="panel-security" aria-labelledby="tab-security" hidden>
    Security content
  </section>
</div>
```

Requirements:

- Support arrow key navigation.
- Support Home and End keys.
- Keep selected tab and visible panel synchronized.
- Work with server-rendered initial state.
- Return cleanup from the enhancer.

## Framework Interoperability

### React

Use native class and data attributes:

```jsx
export function SaveButton() {
  return (
    <button className="re-button" data-variant="primary">
      Save
    </button>
  );
}
```

For custom elements:

```jsx
<re-tabs></re-tabs>
```

React wrappers may be added later for event binding and TypeScript ergonomics.

### Vue

Use the same classes and attributes:

```vue
<template>
  <button class="re-button" data-variant="primary">Save</button>
</template>
```

Vue configuration may be needed so Vue treats `re-*` tags as custom elements.

### Svelte

Use standard markup:

```svelte
<button class="re-button" data-variant="primary">
  Save
</button>
```

Custom elements can be used directly when registered.

### Angular

Use standard markup:

```html
<button class="re-button" data-variant="primary">Save</button>
```

Angular projects may need custom element schema configuration when using `re-*` custom elements.

## Accessibility Checklist

Every component must document:

- Required element type
- Required label behavior
- Keyboard interaction
- Focus behavior
- Disabled behavior
- Error behavior
- ARIA usage if needed
- Native behavior preserved
- Reduced motion behavior if animated

Manual checks:

- Tab through the component.
- Operate with keyboard only.
- Test with visible focus indicators.
- Test with browser zoom.
- Test with dark mode.
- Test with forced colors if available.
- Verify form submission where relevant.

## Browser Feature Strategy

### Safe Foundation

The foundation should rely on broadly available features:

- Semantic HTML
- CSS custom properties
- Flexbox and grid
- Media queries
- ES modules for optional JavaScript

### Progressive Features

These features may be used when documented:

- `dialog`
- Custom elements
- Shadow DOM
- Cascade layers
- Container queries
- Popover API
- Declarative Shadow DOM

The documentation should identify whether a feature is required, optional, or progressive.

## Testing Strategy

Relements uses browser-based component verification as the primary confidence layer. The test stack is documented in detail in `docs/TESTING_STRATEGY.md`.

Primary tools:

- Playwright Test for browser behavior, keyboard interaction, form behavior, dialogs, custom elements, visual snapshots, and ARIA snapshots.
- `@axe-core/playwright` for automated accessibility smoke tests.
- Vitest for pure utility logic only.

### Static Checks

- HTML validation for examples.
- CSS linting if tooling is added.
- JavaScript linting if tooling is added.
- Type checks if TypeScript is added.
- Package export checks.

### Manual Browser Checks

- Plain HTML examples load with CSS only.
- JavaScript examples work after ESM import.
- Components remain usable when JavaScript is disabled where possible.
- Components work inside at least one framework example before release.
- Playwright tests cover Chromium during development.
- Playwright tests cover Chromium, Firefox, and WebKit before release.

### Accessibility Checks

- Keyboard-only operation.
- Focus visibility.
- Native form submission.
- Basic screen reader smoke tests — see [`SCREEN_READER_TESTING.md`](./SCREEN_READER_TESTING.md) for the per-component NVDA/VoiceOver checklist.
- High contrast and forced colors review.
- axe-core smoke tests for example pages and component states.

### Visual Checks

- Light mode.
- Dark mode.
- Small viewport.
- Large viewport.
- Long text.
- Disabled states.
- Error states.
- Loading or pending states where relevant.
- Visual snapshots for stable component states.

Per-element completion requires:

- Plain HTML example.
- Browser behavior test.
- Keyboard test if interactive.
- Accessibility smoke test.
- Focus visibility check.
- Visual snapshot for core states.
- Documentation for usage and edge cases.

## Packaging Strategy

Recommended `package.json` exports:

```json
{
  "name": "@relements/core",
  "type": "module",
  "sideEffects": ["**/*.css", "**/define-*.js", "**/auto-init.js"],
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./index.css": "./dist/index.css",
    "./button.css": "./dist/components/button.css",
    "./form.css": "./dist/components/form.css",
    "./tabs": {
      "import": "./dist/behaviors/tabs.js",
      "types": "./dist/behaviors/tabs.d.ts"
    },
    "./elements/re-tabs": "./dist/elements/re-tabs.js"
  }
}
```

Build output should preserve:

- Full CSS bundle
- Per-component CSS files
- ESM JavaScript modules
- Type declarations

## Versioning

Use semantic versioning. See [VERSIONING.md](./VERSIONING.md) for the authoritative policy — the public API surface, breaking-change rules (including visual changes), and the deprecation policy.

Breaking changes include:

- Removing or renaming CSS classes.
- Removing or renaming CSS custom properties.
- Changing documented DOM structure requirements.
- Changing event names or event details.
- Changing custom element tag names.
- Changing JavaScript function signatures.

Non-breaking changes include:

- Adding new tokens.
- Adding new component variants.
- Adding new optional components.
- Fixing accessibility behavior while preserving public API.

## Contribution Rules

Before adding a new component, document:

- Why native HTML alone is not enough.
- Whether CSS alone is enough.
- Whether JavaScript is required.
- Whether a custom element is justified.
- Accessibility behavior.
- The public API.
- Example markup.

Before adding a dependency, document:

- What problem it solves.
- Why a browser API is not enough.
- Its size and runtime impact.
- Whether it affects framework neutrality.

## Implementation Roadmap

### Phase 1

- Create package structure.
- Add `tokens.css`.
- Add `reset.css`.
- Add `base.css`.
- Add `button.css`.
- Add `form.css`.
- Add `dialog.css`.
- Add static docs examples.

### Phase 2

- Add behavior module pattern.
- Implement `enhanceDismissible`.
- Implement `enhanceDialog`.
- Implement `enhanceTabs`.
- Add cleanup APIs.
- Add keyboard tests or manual test docs.

### Phase 3

- Define custom element conventions.
- Implement `re-tabs`.
- Document attributes, properties, events, slots, and styling hooks.
- Verify usage in plain HTML and at least one framework.

### Phase 4

- Add packaging.
- Add package exports.
- Add TypeScript declarations.
- Add framework adapter examples.
- Add release checklist.

## Release Checklist

- Documentation examples render correctly.
- CSS-only components work without JavaScript.
- JavaScript modules can be imported individually.
- Keyboard behavior is verified.
- Token reference is complete.
- Public API is documented.
- Browser support notes are documented.
- Package exports are verified.
- Version number follows semantic versioning.
