---
title: Svelte
description: Using Relements in a Svelte app.
---

Relements is HTML-first and framework-agnostic: the same `.re-*` classes,
`data-*` attributes, `re-*` `CustomEvent`s, `enhance*(el)` behaviors, and
`<re-*>` custom elements work in Svelte with no wrappers. See the
[behaviors & elements guide](/relements/guides/behaviors-and-elements/) for the
shape of the JS layer; this page is the Svelte glue.

## Install & import the CSS

Add the package and import the stylesheet once at your app entry (e.g.
`main.js`), before you mount the app:

```js
// main.js
import { mount } from "svelte";
import "@relements/core/index.css";
import App from "./App.svelte";

mount(App, { target: document.getElementById("app") });
```

That single import is the whole zero-JS baseline. Write native elements with
`.re-*` classes and `data-*` attributes directly in your markup — Svelte passes
both straight through to the DOM:

```svelte
<button class="re-button" type="button">Save</button>
```

Everything below is the optional JavaScript layer for components that need it.

## Behaviors — a Svelte action

The idiomatic, reusable way to run an `enhance*(el)` on mount and tear it down on
unmount is a **Svelte action**. An action receives the node and returns an object
with a `destroy()` method that Svelte calls when the node is removed — which maps
1:1 onto a behavior's `{ destroy() }` controller. The whole adapter is one line
of glue:

```js
// re-enhance.js
export function enhance(node, behavior) {
  return behavior(node); // { destroy() } → Svelte calls it on unmount
}
```

Apply it with `use:` and pass the behavior as the action argument:

```svelte
<script>
  import { enhance } from "./re-enhance.js";
  import { enhanceTabs } from "@relements/core/behaviors/tabs";
</script>

<div class="re-tabs" data-re-tabs use:enhance={enhanceTabs}>
  <div class="re-tabs__list" role="tablist" aria-label="Settings">
    <button class="re-tab" role="tab" id="tab-1" aria-controls="panel-1" aria-selected="true">One</button>
    <button class="re-tab" role="tab" id="tab-2" aria-controls="panel-2" aria-selected="false" tabindex="-1">Two</button>
  </div>
  <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
  <section class="re-tabpanel" role="tabpanel" id="panel-1" aria-labelledby="tab-1" tabindex="0">Panel one</section>
  <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
  <section class="re-tabpanel" role="tabpanel" id="panel-2" aria-labelledby="tab-2" tabindex="0" hidden>Panel two</section>
</div>
```

One `enhance` action works for every behavior — `use:enhance={enhanceMenuButton}`,
`use:enhance={enhanceCombobox}`, and so on — because they all share the
`enhance*(root) → { destroy() }` contract. The behavior runs after the node (and
its children) are in the DOM, and its `destroy()` runs automatically when the
element leaves it.

If you prefer hooks, `onMount` works too — run the behavior and return its
teardown so `controller.destroy()` runs on unmount:

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

<div class="re-tabs" data-re-tabs bind:this={node}>…</div>
```

The action is the more reusable primitive — define it once, drop `use:enhance`
onto any host — so prefer it. Both clean up correctly when the element unmounts.

## Events

`re-*` events are bubbling `CustomEvent`s. Svelte forwards them like any DOM
event: in Svelte 5 an `on`-prefixed attribute is a listener and event names are
case-sensitive, so `onre-change={onChange}` listens for `re-change`. Read the
payload from `event.detail`:

```svelte
<script>
  import { enhance } from "./re-enhance.js";
  import { enhanceTabs } from "@relements/core/behaviors/tabs";

  let lastTab = $state("none");
  function onChange(event) {
    lastTab = event.detail.tabId; // { tabId, panelId }
  }
</script>

<div class="re-tabs" data-re-tabs use:enhance={enhanceTabs} onre-change={onChange}>
  …
</div>
<p>Last tab: <output>{lastTab}</output></p>
```

The event detail is per-behavior — `enhanceMenuButton` emits `re-select`
(`{ item, value }`), `enhanceTagsInput` emits `re-tags-change` (`{ values }`),
and so on. The [behaviors & elements guide](/relements/guides/behaviors-and-elements/)
lists the payload for each.

## Custom elements

`<re-*>` custom elements are an alternative to calling a behavior — a
self-managing tag that enhances itself on connect and tears down on disconnect,
so you don't need the `use:enhance` action. Svelte renders unknown tag names
like `<re-tabs>` as-is and passes their attributes straight through, so **no
compiler configuration is needed**. Register the element once with its bare
side-effect import — `@relements/core` lists its element modules under
`sideEffects`, so the self-registering `customElements.define()` survives
bundler tree-shaking:

```js
import "@relements/core/elements/re-tabs";
```

Then drop the tag into your template. Bind its `re-change` `CustomEvent` the same
way as any DOM event — `onre-change` — and read `event.detail.tabId`:

```svelte
<script>
  import "@relements/core/elements/re-tabs";

  let lastTab = $state("none");
  function onChange(event) {
    lastTab = event.detail.tabId;
  }
</script>

<re-tabs aria-label="Settings" onre-change={onChange}>
  <div class="re-tabs__list" role="tablist" aria-label="Settings">
    <button class="re-tab" role="tab" id="tab-1" aria-controls="panel-1" aria-selected="true">One</button>
    <button class="re-tab" role="tab" id="tab-2" aria-controls="panel-2" aria-selected="false" tabindex="-1">Two</button>
  </div>
  <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
  <section class="re-tabpanel" role="tabpanel" id="panel-1" aria-labelledby="tab-1" tabindex="0">One</section>
  <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
  <section class="re-tabpanel" role="tabpanel" id="panel-2" aria-labelledby="tab-2" tabindex="0" hidden>Two</section>
</re-tabs>
```

`<re-tabs>` observes its children, so it still enhances correctly when Svelte
projects markup into it later. Five elements ship — [`<re-tabs>`](/relements/custom-elements/re-tabs/),
[`<re-menu>`](/relements/custom-elements/re-menu/), [`<re-popover>`](/relements/custom-elements/re-popover/),
[`<re-toast>`](/relements/custom-elements/re-toast/), and [`<re-file-picker>`](/relements/custom-elements/re-file-picker/); everything else is
behavior-only. Reach for the `use:enhance` action when you want to enhance your
own markup and own the lifecycle; reach for a custom element when you want a
declarative, self-managing tag.

## Forms & native inputs

Relements form controls are native elements with a `.re-*` class, so they bind
with Svelte's normal `bind:value` / `bind:group` / `bind:checked` — there is no
special handling:

```svelte
<script>
  let email = $state("");
</script>

<input class="re-input" type="email" bind:value={email} placeholder="you@example.com" />
```

Behavior-enhanced inputs are still native under the hood and dispatch native
`input`/`change` as they commit (the combobox commits a value, the number
stepper steps it, the tags input submits an array), so `bind:value` keeps
working through the enhancement.

## Mount / unmount

Because the action's `destroy()` (or `onMount`'s returned teardown) runs when the
host leaves the DOM, conditionally-rendered components clean up correctly:

```svelte
<script>
  let mounted = $state(true);
</script>

<button type="button" onclick={() => (mounted = !mounted)}>Toggle</button>

{#if mounted}
  <Tabs />
{/if}
```

Toggling `mounted` off runs `controller.destroy()`, removing every listener the
behavior added; toggling it back on re-enhances a fresh node.

## A11y advisories

The standard WAI-ARIA tabs markup puts `role="tabpanel"` on `<section>`
elements, which makes Svelte's compiler emit
`a11y_no_noninteractive_element_to_interactive_role` warnings. These are false
positives for the tabs pattern and do not affect runtime; suppress them with a
`<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->`
comment above each panel if you want a clean build.

## Runnable example

**Try it now, no install** — open it in a live editor:

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/Renascent-Elements/relements/tree/main/docs/examples/frameworks/svelte?file=src%2FApp.svelte)
[![Edit in CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/Renascent-Elements/relements/tree/main/docs/examples/frameworks/svelte)

:::note[Stuck on "Cloning…"?]
An ad-blocker or privacy shield (Brave Shields, uBlock, …) can block StackBlitz's in-browser runtime. Open it in incognito, try another browser, or allowlist `stackblitz.com`.
:::

A complete, runnable app — `.re-button`, a tabs region enhanced on mount, a
`<re-tabs>` custom element whose `re-change` drives an `<output>`, and
`enhanceMultiSelect`, `enhanceCarousel`, and `enhanceCommandPalette` controls
(DOM-injecting, survive a re-render), plus a toggle
that demonstrates teardown — lives in `docs/examples/frameworks/svelte/`, or on
[GitHub](https://github.com/Renascent-Elements/relements/tree/main/docs/examples/frameworks/svelte).

## Related

- [Behaviors & custom elements](/relements/guides/behaviors-and-elements/) — the full `enhance*` and `<re-*>` reference.
- [Tabs](/relements/components/tabs/) · [Combobox](/relements/components/combobox/) · [Menu button](/relements/components/menu-button/) · [Tags input](/relements/components/tags-input/) — components used above.
