# Implementation Plan

## Purpose

This document defines the practical build roadmap for Relements. It turns the product and technical direction into a staged implementation sequence for the foundation, native HTML elements, progressive JavaScript behaviors, and optional custom elements.

The plan favors small, verifiable releases. Each phase should leave the project usable, documented, and easier to extend.

## Development Principles

- Build the smallest useful primitive first.
- Prefer native HTML and browser behavior.
- Add CSS only after the semantic contract is clear.
- Add JavaScript only when native HTML and CSS are not enough.
- Add custom elements only when a reusable framework-neutral component boundary is justified.
- Keep public APIs stable, explicit, and documented.
- Verify keyboard behavior and accessibility before moving to the next element.

## Repository Shape

Target structure:

```txt
packages/
  core/
    src/
      tokens.css
      reset.css
      base.css
      components/
      behaviors/
      elements/
      index.css
      index.js

docs/
  PRODUCT_REQUIREMENTS.md
  TECHNICAL_DOCUMENTATION.md
  IMPLEMENTATION_PLAN.md
  TESTING_STRATEGY.md
  HTML_FIRST_POLICY.md
  examples/
```

## Phase 0: Project Foundation

Goal: make the repository installable, understandable, and ready for implementation.

Deliverables:

- Package structure under `packages/core`.
- Root package metadata.
- Basic formatting and linting decisions.
- Root README.
- Product, technical, implementation, and testing docs.
- HTML-first compatibility policy.
- Initial `docs/examples` directory.
- Playwright Test configuration.
- axe-core accessibility test setup.
- Vitest setup for pure utility tests.
- Initial test directories.

Acceptance criteria:

- Repository has a clear entry point for contributors.
- Planned package name is `@relements/core`.
- Public naming conventions are fixed: `re-`, `data-re-*`, `--re-*`, `re-*` custom elements.
- HTML/CSS-only usage is documented as a first-class integration path.
- Test commands are defined for unit, browser, accessibility, and visual checks.
- Browser tests run against at least Chromium locally.
- No component implementation is blocked by missing structure.

Target test directories:

```txt
tests/
  elements/
  a11y/
  visual/
  unit/
```

## Phase 1: CSS Foundation

Goal: create the CSS base that every element depends on.

Build order:

1. `tokens.css`
2. `reset.css`
3. `base.css`
4. `index.css`

Deliverables:

- Color tokens.
- Typography tokens.
- Spacing tokens.
- Radius tokens.
- Border tokens.
- Focus tokens.
- Minimal reset.
- Document-level base styles.
- Cascade layer structure.

Acceptance criteria:

- A plain HTML page can load `packages/core/src/index.css`.
- Default text, links, forms, and focus states are readable.
- Tokens can be overridden at `:root` or within a subtree.
- CSS does not require JavaScript or a build step for local examples.
- Browser smoke tests verify CSS loading and token overrides.

## Phase 2: Native Element Styling

Goal: ship useful styling for native HTML elements without replacing browser behavior.

Element order:

1. Button
2. Link
3. Text input
4. Textarea
5. Select
6. Checkbox
7. Radio
8. Field
9. Field group
10. Validation message

Files:

```txt
packages/core/src/components/button.css
packages/core/src/components/link.css
packages/core/src/components/form.css
```

Canonical examples:

```html
<button class="re-button" data-variant="primary">Save</button>
<a class="re-link" href="/docs">Read docs</a>

<label class="re-field">
  <span class="re-field__label">Email</span>
  <input class="re-input" type="email" name="email" />
  <span class="re-field__hint">Use your work email.</span>
</label>
```

Acceptance criteria:

- Native form submission works.
- Disabled states use native `disabled` where possible.
- Focus styles are visible.
- Labels and descriptions are documented.
- Invalid states support native validation and `aria-invalid`.
- Examples work without JavaScript.
- Each element has browser, accessibility, and visual tests before it is marked complete.

## Phase 3: Native Interactive Elements

Goal: style native interactive elements that already have browser behavior.

Element order:

1. Disclosure with `details` and `summary`.
2. Dialog with `dialog`.
3. Progress with `progress`.
4. Meter with `meter`.

Files:

```txt
packages/core/src/components/disclosure.css
packages/core/src/components/dialog.css
packages/core/src/components/progress.css
```

Acceptance criteria:

- `details` works without JavaScript.
- `dialog` preserves native modal behavior.
- `form method="dialog"` works in examples.
- Components remain readable if JavaScript is disabled.
- Motion respects `prefers-reduced-motion`.

## Phase 4: JavaScript Enhancement API

Goal: establish the behavior module pattern before implementing complex behaviors.

Build order:

1. Enhancement helper conventions.
2. `enhanceDismissible`.
3. `enhanceDialog`.
4. `index.js` exports.
5. Optional `auto-init.js`.

Enhancer contract:

```js
const controller = enhanceSomething(root);
controller.destroy();
```

Acceptance criteria:

- Enhancers accept `document`, an element, or a shadow root.
- Enhancers return a cleanup API.
- Enhancers do not auto-run from the main entry module.
- Enhancers can be called from any framework lifecycle.
- Event listeners are removed on cleanup.

## Phase 5: Composite Behaviors

Goal: implement behavior that native HTML cannot fully provide.

Element order:

1. Tabs
2. Accordion helper if `details` is insufficient
3. Menu button
4. Popover helper
5. Toast

Initial priority: **Tabs**.

Tabs acceptance criteria:

- Server-rendered initial state works.
- Arrow key navigation works.
- Home and End keys work.
- Selected tab and visible panel stay synchronized.
- Markup follows ARIA tab pattern.
- Cleanup removes all event listeners.
- Plain HTML fallback remains understandable.

## Phase 6: Optional Custom Elements

Goal: provide framework-neutral elements only where a custom element improves usage.

Candidate order:

1. `re-tabs`
2. `re-toast`
3. `re-menu`
4. `re-popover`

Custom element requirements:

- Dash-case tag name.
- Attributes for primitive configuration.
- Properties for complex runtime data.
- `CustomEvent` for public events.
- Styling hooks documented.
- Shadow DOM decision documented per element.

`re-tabs` acceptance criteria:

- Works in plain HTML.
- Works in React, Vue, Svelte, and Angular examples.
- Emits a documented `re-change` event.
- Provides documented slots or light DOM structure.
- Does not require a framework runtime.

## Phase 7: Packaging

Goal: make Relements consumable as a real package.

Deliverables:

- `package.json` exports.
- Full CSS bundle.
- Per-component CSS exports.
- ESM JavaScript exports.
- TypeScript declarations.
- Release checklist.

Target exports:

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./index.css": "./dist/index.css",
    "./button.css": "./dist/components/button.css",
    "./form.css": "./dist/components/form.css",
    "./tabs": "./dist/behaviors/tabs.js",
    "./elements/re-tabs": "./dist/elements/re-tabs.js"
  }
}
```

Acceptance criteria:

- Consumers can import the full CSS bundle.
- Consumers can import one component CSS file.
- Consumers can import one behavior module.
- JavaScript remains tree-shakable.
- CSS side effects are declared.

## Phase 8: Framework Examples

Goal: prove framework neutrality without making wrappers the main API.

Examples:

- Plain HTML.
- React.
- Vue.
- Svelte.
- Angular.

Acceptance criteria:

- Same class and attribute API works across examples.
- Custom elements are documented for each framework.
- Any framework-specific caveats are documented.
- Wrappers are considered only after the platform API is stable.
- Framework wrappers render the same canonical HTML, class, attribute, token, and event contract.
- No wrapper-only component behavior is introduced.

## Element Development Checklist

Every new element must include:

- Purpose.
- Native HTML baseline.
- Public classes.
- Public attributes.
- CSS custom properties.
- JavaScript behavior, if any.
- Custom element decision, if any.
- Accessibility notes.
- Keyboard behavior.
- Example markup.
- Playwright behavior tests.
- axe-core accessibility smoke tests.
- Visual snapshot coverage for stable states.
- Manual verification steps.

## Release Sequence

### `0.1.0`: Foundation Preview

- Tokens.
- Reset.
- Base styles.
- Button.
- Link.
- Basic form styles.
- Plain HTML examples.

### `0.2.0`: Native Interaction Preview

- Disclosure.
- Dialog.
- Progress.
- Meter.
- Dialog helper.

### `0.3.0`: Behavior Preview

- Enhancement API.
- Dismissible behavior.
- Tabs behavior.
- JavaScript documentation.

### `0.4.0`: Custom Element Preview

- Custom element conventions.
- `re-tabs`.
- Framework usage examples.

### `1.0.0`: Stable Core

- Stable token names.
- Stable class names.
- Stable behavior APIs.
- Stable package exports.
- Accessibility checklist completed for all core elements.

## Current Next Step

Start with Phase 0, then implement Phase 1 immediately after the repository structure is in place.
