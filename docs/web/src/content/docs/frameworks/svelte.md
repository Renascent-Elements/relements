---
title: Svelte
description: Using Relements in a Svelte app.
---

Import the stylesheet once at your app entry (e.g. `main.js`):

```js
import "@relements/core/index.css";
```

Then use native elements with Relements classes in your markup:

```svelte
<button class="re-button" type="button">Save</button>
```

## Behaviors

Run a behavior like `enhanceTabs()` in `onMount` against a bound node, and
return its teardown so `controller.destroy()` runs on unmount:

```svelte
<script>
  import { onMount } from "svelte";
  import { enhanceTabs } from "@relements/core/behaviors/tabs";

  let node;
  onMount(() => {
    const controller = enhanceTabs(node);
    return () => controller.destroy();
  });
</script>
```

## Custom elements

`<re-tabs>` renders as-is — Svelte does not validate unknown tag names, so no
compiler configuration is needed. Register the element once with its bare
side-effect import:

```js
import "@relements/core/elements/re-tabs";
```

In Svelte 5 any `on`-prefixed attribute is a listener and event names are
case-sensitive, so `onre-change={onChange}` listens for the `re-change`
`CustomEvent`. Read the new tab from `event.detail.tabId`:

```svelte
<re-tabs onre-change={onChange}>…</re-tabs>
```

The WAI-ARIA tabs markup uses `role="tabpanel"` on `<section>` elements, which
makes Svelte's compiler emit `a11y_no_noninteractive_element_to_interactive_role`
warnings. These are false positives for the tabs pattern and do not affect
runtime; suppress them with a `<!-- svelte-ignore … -->` comment above each panel
if you want a clean build.

See the runnable example in `docs/examples/frameworks/svelte/`, or on
[GitHub](https://github.com/Renascent-Elements/relements/tree/main/docs/examples/frameworks/svelte).
