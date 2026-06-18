---
title: Frameworks
description: Use Relements with React, Vue, Svelte, or Angular.
---

Relements is **framework-agnostic with no wrappers**. There is no
`@relements/react` or `@relements/vue` — the published package is just
`@relements/core`, and the _same_ surface works everywhere:

- **`.re-*` classes** on native elements — the zero-JS styling baseline.
- **`data-*` attributes** — declarative hooks that behaviors read.
- **`re-*` `CustomEvent`s** — bubbling DOM events you listen to with
  `addEventListener`.
- **`enhance*(root) → { destroy() }` behaviors** — optional JS that wires a
  subtree and tears itself down.
- **`<re-*>` light-DOM custom elements** — self-registering, self-managing tags.

Because all five are plain web-platform primitives — classes, attributes, DOM
events, functions, and custom elements — every framework already speaks them.
The only thing that differs per framework is **where you call `enhance*()` on
mount and `destroy()` on unmount**, plus a line or two of config so the
framework lets `<re-*>` tags and their events through.

## The integration shape

Every framework page boils down to the same five steps:

1. **Install + import the CSS once** at the app entry —
   `import "@relements/core/index.css";`. From here, native elements with
   `.re-*` classes and `data-*` attributes work with **zero JavaScript**.

   ```jsx
   <button className="re-button" type="button">
     Save
   </button>
   ```

2. **Behaviors** — run `enhance*(el)` in the framework's "on mount" primitive
   against a ref to your subtree, and call the returned `controller.destroy()`
   in "on unmount". That is the whole lifecycle; behaviors are idempotent and
   remove every listener they added.

   ```js
   const controller = enhanceTabs(el); // on mount
   // …
   controller.destroy(); // on unmount
   ```

3. **Events** — a `re-*` `CustomEvent` is a normal bubbling DOM event. Listen
   with the framework's event syntax and read `event.detail` (e.g.
   `enhanceTabs` emits `re-change` with `{ tabId, panelId }`).

4. **Custom elements** — `<re-*>` are **light-DOM** custom elements, so they
   need no Shadow-DOM workarounds. Register each one with its bare
   side-effect import (`import "@relements/core/elements/re-tabs";` —
   `package.json` lists `elements/*.js` under `sideEffects` so the
   `customElements.define` survives tree-shaking), then tell the framework to
   pass the unknown tag through:

   | Framework | Config to allow `<re-*>` tags                 | Listening to `re-change`                         |
   | --------- | --------------------------------------------- | ------------------------------------------------ |
   | React 19  | none — renders unknown tags as-is             | `ref` + `addEventListener` in `useEffect`        |
   | Vue       | `isCustomElement: (t) => t.startsWith("re-")` | `@re-change="onChange"`                          |
   | Svelte 5  | none — unknown tags pass through              | `onre-change={onChange}` (case-sensitive)        |
   | Angular   | `CUSTOM_ELEMENTS_SCHEMA` on the component     | `(re-change)="onChange($event)"` (cast `$event`) |

5. **Forms / native inputs** — `.re-input`, `.re-select`, `.re-textarea`,
   `.re-checkbox`, … are just classes on **native** form controls, so they
   bind with the framework's ordinary model/state (`value`/`onChange`,
   `v-model`, `bind:value`, `[(ngModel)]`) with **no special handling**.

That is it. The DOM, class names, `--re-*` tokens, and event contract are
identical across stacks; only the glue in steps 2 and 4 changes.

## Pick your framework

Each page mirrors a **runnable example app** and walks through the five steps
above:

- [React](/relements/frameworks/react/)
- [Vue](/relements/frameworks/vue/)
- [Svelte](/relements/frameworks/svelte/)
- [Angular](/relements/frameworks/angular/)

**Open any example live, no install** — in
[StackBlitz](https://stackblitz.com/github/Renascent-Elements/relements/tree/main/docs/examples/frameworks/react?file=src%2FApp.jsx)
or [CodeSandbox](https://codesandbox.io/s/github/Renascent-Elements/relements/tree/main/docs/examples/frameworks/react)
(each framework page has its own one-click buttons).

Not using a framework? The same markup is the baseline everywhere — see
[plain HTML usage](/relements/guides/html-first/), where `<re-*>` elements work
as-is and you listen with `addEventListener("re-change", …)`.

## The example corpus

Every framework page is backed by an app under
`docs/examples/frameworks/<fw>/` that consumes **only** the published
`@relements/core` API. All five render the same one flow:

- a `<button class="re-button">` — the **CSS class** surface;
- a tabs region enhanced by `enhanceTabs()` — the **behavior** surface, with
  its `re-change` event and `destroy()` teardown (the apps mount/unmount the
  region to prove cleanup);
- a `<re-tabs>` custom element whose `re-change` event updates an `<output>` —
  the **custom-element + event** surface.

The DOM, class names, `--re-*` tokens, and `re-change` contract are identical
across all five; only the framework glue differs. Browse the source on
[GitHub](https://github.com/Renascent-Elements/relements/tree/main/docs/examples/frameworks).

## Related

- [Behaviors & custom elements](/relements/guides/behaviors-and-elements/) — the
  full `enhance*` contract, the `<re-*>` elements, and which to reach for.
- [HTML-first policy](/relements/guides/html-first/) — why JS is an optional
  layer over markup that already works.
- [Tabs](/relements/components/tabs/) · [`<re-tabs>`](/relements/custom-elements/re-tabs/) —
  the component used throughout the examples.
