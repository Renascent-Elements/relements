---
title: React
description: Using Relements in a React app.
---

Import the stylesheet once at your app entry (e.g. `main.jsx`):

```js
import "@relements/core/index.css";
```

Then use native elements with Relements classes in JSX — `className` carries the
`.re-*` classes and React passes string attributes (including `data-*`) straight
through:

```jsx
<button className="re-button" type="button">
  Save
</button>
```

## Behaviors

Run a behavior like `enhanceTabs()` in `useEffect` against a `ref`, and return
its `controller.destroy()` for cleanup so it tears down on unmount (and on every
`StrictMode` remount in development):

```jsx
import { useEffect, useRef } from "react";
import { enhanceTabs } from "@relements/core/behaviors/tabs";

const ref = useRef(null);
useEffect(() => {
  const controller = enhanceTabs(ref.current);
  return () => controller.destroy();
}, []);
```

## Custom elements

React 19 renders unknown tags like `<re-tabs>` as-is and passes string
attributes through, so the light-DOM markup just works. Register the element
once with its bare side-effect import — `@relements/core` lists its element
modules in `sideEffects`, so the self-registering `customElements.define`
survives bundler tree-shaking:

```js
import "@relements/core/elements/re-tabs";
```

There is no `onReChange` prop for the `re-change` `CustomEvent`. Get a `ref` to
the element and `addEventListener("re-change", …)` inside `useEffect`, returning
the matching `removeEventListener` for cleanup. Read the new tab from
`event.detail.tabId`.

See the runnable example in `docs/examples/frameworks/react/`, or on
[GitHub](https://github.com/Renascent-Elements/relements/tree/main/docs/examples/frameworks/react).
