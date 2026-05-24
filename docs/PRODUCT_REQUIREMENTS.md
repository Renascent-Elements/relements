# Product Requirements Document

## Product Name

**Relements**

## Summary

Relements is a small, framework-neutral frontend design system by Renascent Elements. It is built from the web platform up: semantic HTML first, CSS for consistent styling and design tokens, and JavaScript only for behavior that native HTML and CSS cannot provide well.

Relements should be usable in plain HTML and in applications built with React, Vue, Svelte, Angular, server-rendered templates, static sites, and other frontend stacks.

Plain HTML plus CSS is a first-class product requirement, not a fallback. Framework support must be added progressively through thin wrappers over the canonical platform API.

## Problem

Modern frontend teams often need consistent UI primitives, but many design systems are tied to a specific framework, build pipeline, rendering model, or styling philosophy. This creates friction when teams use multiple frameworks, migrate between frameworks, or need simple UI primitives in server-rendered or static environments.

This project exists to provide a minimal design foundation that treats the browser as the primary runtime.

## Goals

- Provide a small, reliable set of UI primitives for modern web apps.
- Prefer native HTML elements and browser behavior wherever possible.
- Use CSS custom properties as the main theming and token API.
- Use low-specificity CSS that can be overridden by product teams.
- Provide progressive enhancement through small JavaScript modules.
- Support framework-neutral usage as the default path.
- Preserve HTML/CSS-only usage for basic elements and styles.
- Allow optional Web Components for UI that needs encapsulated behavior.
- Add framework wrappers only after the underlying HTML, CSS, JavaScript, and event APIs are stable.
- Keep installation, usage, and mental model simple.
- Make accessibility and keyboard behavior part of the default component contract.

## Non-Goals

- Do not create a full application framework.
- Do not compete with large component suites in scope.
- Do not require React, Vue, Svelte, Angular, or any other UI framework.
- Do not require CSS-in-JS.
- Do not require a build step for basic usage.
- Do not make framework wrappers the canonical API.
- Do not hide native HTML controls behind custom components unless there is a clear benefit.
- Do not enforce a strong visual brand by default.
- Do not provide complex application patterns such as data grids, charts, or rich text editors in the first release.

## Target Users

### Primary Users

- Frontend developers building web applications across different frameworks.
- Product engineers who want consistent primitives without adopting a large UI library.
- Teams maintaining server-rendered or progressively enhanced applications.
- Developers building internal tools, SaaS applications, dashboards, and content-heavy sites.

### Secondary Users

- Designers who need a stable vocabulary for spacing, typography, colors, and component states.
- Design system maintainers who want a lightweight foundation for a custom system.
- Teams migrating between frontend frameworks.

## Product Principles

1. **HTML First**
   Use native HTML elements before creating abstractions. Basic usage must remain possible with plain HTML and CSS.

2. **CSS Before JavaScript**
   Use CSS for visual styling, layout, state styling, theming, and responsive behavior.

3. **JavaScript As Enhancement**
   JavaScript should attach behavior to existing markup, not make basic content inaccessible without it.

4. **Framework-Neutral Core**
   The public API should be HTML, CSS, DOM APIs, ESM modules, attributes, events, and CSS custom properties.

5. **Wrappers Are Adapters**
   Framework wrappers may improve ergonomics, but they must render and preserve the same canonical platform API.

6. **Small Surface Area**
   Every primitive should justify its existence. The system should be easy to learn and easy to replace.

7. **Unopinionated By Default**
   Provide usable defaults, but make styling and composition easy to override.

8. **Accessibility Is Part Of The Contract**
   Keyboard behavior, focus management, semantics, labels, and form behavior are product requirements, not polish.

## User Stories

### Plain HTML Usage

As a developer, I want to use the design system by linking a CSS file so that I can style static or server-rendered pages without JavaScript or a frontend framework.

Acceptance criteria:

- A page can load `index.css` and use documented classes.
- Native buttons, links, forms, dialogs, and disclosures work without custom JavaScript where possible.
- Components remain readable and usable if CSS fails to load.

### Framework Usage

As a React, Vue, Svelte, or Angular developer, I want to use the same HTML classes and attributes so that I do not need a separate implementation for each framework.

Acceptance criteria:

- Components can be used directly in JSX, Vue templates, Svelte templates, Angular templates, and plain HTML.
- Framework wrappers are optional.
- The documented canonical API does not depend on framework-specific props.

### Theming

As a product team, I want to customize colors, spacing, radius, typography, and component states using CSS variables so that I can adapt the system to my app without forking it.

Acceptance criteria:

- Core tokens are exposed as CSS custom properties.
- Component styles use documented tokens.
- A theme can be applied globally or within a subtree.
- Default tokens support light mode, dark mode, and high contrast environments where practical.

### Progressive Enhancement

As a developer, I want interactive components to start from semantic markup so that baseline behavior remains usable and JavaScript adds richer behavior only when loaded.

Acceptance criteria:

- JavaScript modules are opt-in.
- Enhancers can attach to a document, shadow root, or specific element.
- Enhanced components expose lifecycle-safe initialization and teardown.
- No global framework runtime is required.

### Advanced Components

As a developer, I want optional custom elements for components that need internal behavior so that I can use them across frameworks with a single implementation.

Acceptance criteria:

- Custom elements use dash-case names.
- Custom elements accept attributes for primitive values.
- Custom elements expose properties for complex values when needed.
- Custom elements emit standard `CustomEvent` events.
- Shadow DOM is used only where encapsulation is worth the styling tradeoff.

## Initial Component Scope

### Foundation

- Tokens
- Reset or normalize layer
- Base document styles
- Typography defaults
- Focus styles
- Layout helpers only when essential

### Native Component Styling

- Button
- Link
- Text input
- Textarea
- Select
- Checkbox
- Radio
- Field group
- Form field
- Validation message
- Disclosure using `details` and `summary`
- Dialog using `dialog`

### Progressive JavaScript Enhancements

- Dismissible element
- Tabs
- Dialog helper
- Disclosure helper only if needed

### Later Components

- Toast
- Menu button
- Popover
- Tooltip
- Combobox
- Switch
- Segmented control
- Accordion

## Public API Requirements

The stable public API should include:

- CSS files
- CSS custom properties
- CSS classes
- `data-*` attributes
- Native HTML attributes
- ESM JavaScript modules
- Custom elements where appropriate
- DOM events using `CustomEvent`
- TypeScript types where useful

The stable public API should avoid:

- Framework-specific component props as the canonical interface
- Required global JavaScript initialization for static components
- Styling APIs that depend on generated class names
- Deep DOM structure dependencies unless explicitly documented

## Accessibility Requirements

- Use semantic HTML by default.
- Preserve native form behavior.
- Provide visible focus styles.
- Support keyboard operation for interactive components.
- Respect `prefers-reduced-motion`.
- Support high contrast and forced colors where practical.
- Avoid replacing native controls unless the replacement matches expected accessibility behavior.
- Document labeling requirements for every form-related component.

## Browser Support

The design system targets modern evergreen browsers.

Baseline usage should work with:

- Standard HTML
- Modern CSS custom properties
- Modern layout features
- ES modules for optional JavaScript

Advanced features may use:

- Custom elements
- Shadow DOM
- `dialog`
- Popover API
- Container queries
- Cascade layers

Advanced features must be documented with fallback expectations.

## Distribution Requirements

The package should support:

- Direct CSS import
- Direct JavaScript ESM import
- CDN usage for prototypes
- Package manager installation
- Tree-shakable JavaScript modules
- Per-component CSS imports
- Full bundled CSS import

Example imports:

```js
import "@relements/core/index.css";
import { enhanceTabs } from "@relements/core/tabs";
```

```html
<link rel="stylesheet" href="/relements/index.css">
<script type="module" src="/relements/index.js"></script>
```

## Documentation Requirements

Documentation must include:

- Plain HTML examples
- Framework usage examples
- Accessibility notes
- Token reference
- Component anatomy
- Attribute reference
- JavaScript API reference
- Theming guide
- Progressive enhancement guide
- Browser support notes
- Testing strategy
- Per-element verification checklist

## Milestones

### Milestone 1: Static Foundation

Deliver:

- Project documentation
- Token CSS
- Reset CSS
- Base CSS
- Button styles
- Form styles
- Dialog styles
- Plain HTML documentation page

Success criteria:

- A static HTML page can use the system with only CSS.
- Components are readable, keyboard accessible, and themeable.

### Milestone 2: Progressive Behaviors

Deliver:

- JavaScript enhancement API
- Tabs behavior
- Dismissible behavior
- Dialog helper
- Documentation examples

Success criteria:

- Interactive behavior can be loaded with ESM modules.
- Enhancers can initialize and clean up without framework assumptions.

### Milestone 3: Optional Custom Elements

Deliver:

- Custom element authoring pattern
- `re-tabs` custom element
- Event and attribute conventions
- Styling and theming guidance for Shadow DOM

Success criteria:

- A custom element can be used in plain HTML and major frontend frameworks.
- Styling hooks are documented and stable.

### Milestone 4: Packaging And Adapters

Deliver:

- Package exports
- Per-component CSS exports
- TypeScript declarations
- Optional React wrapper examples
- Optional Vue wrapper examples
- Optional Svelte and Angular usage notes

Success criteria:

- Consumers can install and import only the parts they need.
- The platform API remains canonical.

## Success Metrics

- A developer can create a styled form in under 10 minutes using only HTML and CSS.
- A developer can use the same component markup in plain HTML and a framework app.
- The core CSS remains small and understandable.
- The first release has no required runtime dependency.
- Components pass manual keyboard checks.
- The documentation clearly explains when to use HTML, CSS, JavaScript, and custom elements.

## Risks

- Web Components can introduce styling and server-rendering tradeoffs if overused.
- Too many variants can make the system opinionated and large.
- Accessibility can regress if native elements are replaced unnecessarily.
- Framework wrappers can accidentally become the real API.
- CSS token naming can become hard to change after adoption.

## Open Questions

- What browser support baseline should be officially documented?
- Should the npm `@relements` scope be registered as an organization or owned by an individual maintainer account?
- Should the first documentation site remain plain HTML or use a static site generator later?
- Should Shadow DOM be used by default for custom elements, or only for specific components?
- What visual personality should the default theme have: neutral utility, editorial, application-focused, or brand-ready?
