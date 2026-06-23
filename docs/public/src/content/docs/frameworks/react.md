---
title: React
description: Using Relements in a React app.
---

Relements has no React wrapper, and it needs none. You write native HTML in JSX
with `.re-*` classes and `data-*` attributes, opt into the
[`enhance*` behaviors and `<re-*>` custom elements](/relements/guides/behaviors-and-elements/)
when you want the optional JS layer, and bind native form controls with ordinary
React state. The class/attribute/event contract is identical to every other
framework — only the glue below is React-shaped.

## Install & import the CSS

Install the package, then import the stylesheet **once** at your app entry
(e.g. `main.jsx`) so the `re.*` cascade layers load before anything renders:

```bash
npm install @relements/core
```

```jsx
// main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@relements/core/index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

That is the entire zero-JS baseline. Write native elements with Relements
classes in JSX — `className` carries the `.re-*` classes and React passes string
attributes (including `data-*` and ARIA) straight through:

```jsx
<button className="re-button" type="button">
  Save
</button>
```

Everything that does not need interaction — buttons, [cards](/relements/components/card/),
[badges](/relements/components/badge/), [fields](/relements/components/field/) — is
done at this point. The sections below add the optional behavior layer.

## Behaviors

A [behavior](/relements/guides/behaviors-and-elements/) is a function
`enhance*(root)` that wires the markup under `root` and returns a controller
`{ destroy() }`. The idiomatic React primitive for "run on mount, clean up on
unmount" is `useEffect` with a `ref`. Wrap that pairing in a tiny reusable hook:

```jsx
// useEnhance.js
import { useEffect, useRef } from "react";

// Runs enhanceFn(node) on mount and the returned controller.destroy() on cleanup.
export function useEnhance(enhanceFn) {
  const ref = useRef(null);
  useEffect(() => {
    const controller = enhanceFn(ref.current);
    return () => controller.destroy();
  }, [enhanceFn]);
  return ref;
}
```

Returning `destroy()` from the effect is **not optional** in React: `StrictMode`
deliberately mounts, unmounts, and remounts every component once in development,
so a behavior that does not tear down would double-wire its markup. The
`destroy()` cleanup makes the remount a clean re-initialization (behaviors are
also idempotent, so a stray re-run is a no-op — but the listeners still need
removing).

Use it by spreading the returned `ref` onto the behavior's host element:

```jsx
import { enhanceTabs } from "@relements/core/behaviors/tabs";
import { useEnhance } from "./useEnhance.js";

function Tabs() {
  const ref = useEnhance(enhanceTabs);
  return (
    <div className="re-tabs" data-re-tabs ref={ref}>
      <div className="re-tabs__list" role="tablist" aria-label="Sections">
        <button className="re-tab" role="tab" id="t1" aria-controls="p1" aria-selected="true">
          One
        </button>
        <button
          className="re-tab"
          role="tab"
          id="t2"
          aria-controls="p2"
          aria-selected="false"
          tabIndex={-1}
        >
          Two
        </button>
      </div>
      <section className="re-tabpanel" role="tabpanel" id="p1" aria-labelledby="t1" tabIndex={0}>
        Panel one
      </section>
      <section
        className="re-tabpanel"
        role="tabpanel"
        id="p2"
        aria-labelledby="t2"
        tabIndex={0}
        hidden
      >
        Panel two
      </section>
    </div>
  );
}
```

The same hook works for any of the
[behaviors](/relements/guides/behaviors-and-elements/#the-behaviors) —
`enhanceDialog`, `enhanceMenuButton`, `enhanceCombobox`, and the rest — since
they all share the `enhance*(root) → { destroy() }` contract. Pass a behavior
that takes options by wrapping it: `useEnhance((el) => enhanceCombobox(el))`.

## Events

Behaviors and custom elements emit bubbling `re-*` `CustomEvent`s. There is **no
`onReChange` prop** — React's synthetic event system only knows the standard DOM
events — so listen the DOM way: a `ref` plus `addEventListener` inside
`useEffect`, returning the matching `removeEventListener` for cleanup. Read the
payload from `event.detail`:

```jsx
import { useEffect, useRef, useState } from "react";

function TabsWithOutput() {
  const ref = useRef(null);
  const [lastTab, setLastTab] = useState("none");

  useEffect(() => {
    const el = ref.current;
    const onChange = (event) => setLastTab(event.detail.tabId); // { tabId, panelId }
    el.addEventListener("re-change", onChange);
    return () => el.removeEventListener("re-change", onChange);
  }, []);

  return (
    <>
      <div className="re-tabs" data-re-tabs ref={ref}>
        {/* …tablist + panels… */}
      </div>
      <p>
        Last tab: <output>{lastTab}</output>
      </p>
    </>
  );
}
```

Because `re-*` events bubble, you can also attach a single listener to a common
ancestor instead of each host. The event name and `detail` shape are
[public API](/relements/guides/versioning/); see each component page for its
payload (e.g. [Tabs](/relements/components/tabs/) emits `{ tabId, panelId }`,
[Menu button](/relements/components/menu-button/) emits `{ item, value }`).

## Custom elements

The five [`<re-*>` custom elements](/relements/guides/behaviors-and-elements/#custom-elements)
are a declarative alternative to calling a behavior yourself — drop the tag in
and it enhances and cleans itself up via `connectedCallback` /
`disconnectedCallback`. React 19 renders unknown tags like `<re-tabs>` as-is and
passes string attributes through verbatim, so the light-DOM markup just works
with no extra configuration. (On React 18 and earlier, unknown lowercase tags
also render, but React forwards only string/number attributes — which is all
these elements take — so the same markup is fine; the dedicated custom-element
property and event support landed in React 19.)

Register each element you use with its **bare side-effect import**. The import
runs `customElements.define()` for you; `@relements/core` lists its
`elements/*.js` modules under `sideEffects`, so the registration survives
bundler tree-shaking:

```jsx
import "@relements/core/elements/re-tabs";

function CustomElementTabs() {
  return (
    <re-tabs aria-label="Sections">
      <div className="re-tabs__list" role="tablist" aria-label="Sections">
        <button className="re-tab" role="tab" id="a1" aria-controls="ap1" aria-selected="true">
          Alpha
        </button>
        <button
          className="re-tab"
          role="tab"
          id="a2"
          aria-controls="ap2"
          aria-selected="false"
          tabIndex={-1}
        >
          Beta
        </button>
      </div>
      <section className="re-tabpanel" role="tabpanel" id="ap1" aria-labelledby="a1" tabIndex={0}>
        Alpha panel
      </section>
      <section
        className="re-tabpanel"
        role="tabpanel"
        id="ap2"
        aria-labelledby="a2"
        tabIndex={0}
        hidden
      >
        Beta panel
      </section>
    </re-tabs>
  );
}
```

Custom elements emit the same `re-*` events as their behaviors, so listen for
them exactly as in [Events](#events) above — a `ref` on the `<re-tabs>` host and
`addEventListener("re-change", …)` in `useEffect`. The element re-dispatches the
behavior's event, so `event.detail.tabId` reads the same.

## Forms & native inputs

Relements form controls are native elements with a `.re-*` class, so they bind
to React state with no special handling — `.re-input`, `.re-select`, and the
rest are just `<input>` / `<select>` you make controlled the ordinary way:

```jsx
function NameField() {
  const [name, setName] = useState("");
  return (
    <div className="re-field">
      <label className="re-label" htmlFor="name">
        Name
      </label>
      <input
        className="re-input"
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </div>
  );
}
```

Behavior-enhanced inputs commit through the same native events React already
listens for: [`enhanceCombobox`](/relements/components/combobox/) and
[`enhanceNumberStepper`](/relements/components/number-stepper/) dispatch native
`input`/`change`, so your `onChange` fires normally. The only ones with a custom
event are [`enhanceTagsInput`](/relements/components/tags-input/) (`re-tags-change`,
`{ values }`) — listen for that as in [Events](#events) — and
[`enhanceRange`](/relements/components/range/), whose two-thumb slider emits
plain native `input`/`change`.

## Runnable example

**Try it now, no install** — open it in a live editor:

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/Renascent-Elements/relements/tree/main/docs/examples/frameworks/react?file=src%2FApp.jsx)
[![Edit in CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/Renascent-Elements/relements/tree/main/docs/examples/frameworks/react)

:::note[Stuck on "Cloning…"?]
An ad-blocker or privacy shield (Brave Shields, uBlock, …) can block StackBlitz's in-browser runtime. Open it in incognito, try another browser, or allowlist `stackblitz.com`.
:::

The full flow above — a `.re-button`, an `enhanceTabs()` region wired through
`useEnhance`, and a `<re-tabs>` custom element whose `re-change` event drives an
`<output>`, plus a "Toggle tabs" button that mounts/unmounts the subtree to
exercise the `destroy()` teardown — lives in
`docs/examples/frameworks/react/`, or on
[GitHub](https://github.com/Renascent-Elements/relements/tree/main/docs/examples/frameworks/react).

## Related

- [Behaviors & custom elements](/relements/guides/behaviors-and-elements/) — the `enhance*` and `<re-*>` contract in full.
- [Other frameworks](/relements/frameworks/) — Vue, Svelte, and Angular recipes for the same flow.
