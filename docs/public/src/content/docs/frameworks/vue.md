---
title: Vue
description: Using Relements in a Vue app.
---

Relements is [HTML-first](/relements/guides/html-first/): the same `.re-*`
classes, `data-*` attributes, `re-*` `CustomEvent`s, `enhance*` behaviors, and
`<re-*>` custom elements work in Vue with no wrappers. This page shows the
idiomatic Vue 3 (`<script setup>`) way to wire each layer. For the layers
themselves, see the [behaviors & elements guide](/relements/guides/behaviors-and-elements/).

## Install and import the CSS

Import the stylesheet once at your app entry (e.g. `main.js`), before mounting:

```js
import { createApp } from "vue";
import "@relements/core/index.css";
import App from "./App.vue";

createApp(App).mount("#app");
```

Then use native elements with Relements classes in your templates. This is the
zero-JS baseline — no behavior, no custom element, just markup and CSS:

```vue
<button class="re-button" type="button">Save</button>
```

Static `data-*` attributes are plain HTML attributes, so they pass straight
through; bind dynamic ones with `:data-*` as usual.

## Behaviors

A behavior is `enhance*(root) → { destroy() }`. The idiomatic Vue way to manage
that lifecycle is a **custom directive**: its `mounted` hook receives the real
DOM element and runs the behavior; its `unmounted` hook calls `destroy()`. Write
it once, reuse it on any element.

```js
// v-enhance.js — a reusable directive that runs any enhance* and tears it down.
export function makeEnhanceDirective(enhance) {
  const controllers = new WeakMap();
  return {
    mounted(el) {
      controllers.set(el, enhance(el));
    },
    unmounted(el) {
      controllers.get(el)?.destroy();
      controllers.delete(el);
    },
  };
}
```

Register it with the behavior you want and drop it on the host element:

```vue
<script setup>
import { enhanceTabs } from "@relements/core/behaviors/tabs";
import { makeEnhanceDirective } from "./v-enhance.js";

const vEnhanceTabs = makeEnhanceDirective(enhanceTabs);
</script>

<template>
  <div v-enhance-tabs class="re-tabs" data-re-tabs>
    <!-- role="tablist" / role="tab" / role="tabpanel" markup -->
  </div>
</template>
```

Because the directive owns the element, `enhanceTabs` runs after the subtree is
in the DOM and `destroy()` runs when it leaves — including across a `v-if`
toggle, which remounts a fresh instance.

### Alternative: a composable

If you prefer a `ref`-based style, the same lifecycle works as a composable
built on `onMounted` / `onUnmounted`. The directive is usually cleaner (no
template ref to thread through), but a composable reads naturally when the
component already holds a ref to the host:

```js
// use-enhance.js
import { onMounted, onUnmounted } from "vue";

export function useEnhance(enhance, elRef) {
  let controller = null;
  onMounted(() => {
    controller = enhance(elRef.value);
  });
  onUnmounted(() => controller?.destroy());
}
```

```vue
<script setup>
import { useTemplateRef } from "vue";
import { enhanceTabs } from "@relements/core/behaviors/tabs";
import { useEnhance } from "./use-enhance.js";

const tabs = useTemplateRef("tabs");
useEnhance(enhanceTabs, tabs);
</script>

<template>
  <div ref="tabs" class="re-tabs" data-re-tabs>…</div>
</template>
```

## Events

Behaviors and custom elements emit bubbling `re-*` `CustomEvent`s. Vue 3 binds
native custom events with `@`, so `@re-change` listens for `re-change`. Read the
payload from `$event.detail` (or the `event` argument in a handler):

```vue
<script setup>
function onChange(event) {
  console.log(event.detail.tabId); // { tabId, panelId }
}
</script>

<template>
  <div class="re-tabs" data-re-tabs @re-change="onChange">…</div>
</template>
```

The event name is exactly the `re-*` name — Vue does not camelCase custom event
listeners, so write `@re-change`, `@re-select`, `@re-dismiss`, etc.

## Custom elements

`<re-*>` elements are light-DOM and self-register on import. The Vue-specific
gotcha is the template compiler: by default Vue tries to resolve an unknown tag
as a component and warns. Tell it to treat `re-*` tags as native custom elements
via `isCustomElement` in `@vitejs/plugin-vue`:

```js
// vite.config.js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith("re-"),
        },
      },
    }),
  ],
});
```

Then register the element once with its bare side-effect import — `@relements/core`
lists its element modules in `sideEffects`, so the self-registering
`customElements.define` survives bundler tree-shaking:

```js
import "@relements/core/elements/re-tabs";
```

Now `<re-tabs>` works natively in templates. String attributes pass straight
through, and the element re-dispatches the behavior's events, so bind them the
same way — `@re-change` reading `$event.detail.tabId`:

```vue
<re-tabs aria-label="Sections" @re-change="onChange">
  <div class="re-tabs__list" role="tablist">…</div>
  <!-- role="tabpanel" sections -->
</re-tabs>
```

`<re-tabs>` also exposes a `value` property (the selected tab id). To set it
imperatively, bind it as a DOM property with `.prop`:
`<re-tabs :value.prop="active">`.

## Forms and native inputs

Native form controls styled with `.re-*` are still native controls, so `v-model`
binds them with no special handling — the class is purely cosmetic:

```vue
<input class="re-input" v-model="email" type="email" />
<select class="re-select" v-model="role">…</select>
<input class="re-checkbox" v-model="agree" type="checkbox" />
```

Behaviors that drive native inputs (e.g. [`enhanceCombobox`](/relements/components/combobox/),
[`enhanceTagsInput`](/relements/components/tags-input/),
[`enhanceNumberStepper`](/relements/components/number-stepper/)) commit through
native `input`/`change` events, so `v-model` stays in sync with what the behavior
writes.

## Runnable example

See the runnable example in `docs/examples/frameworks/vue/`, or on
[GitHub](https://github.com/Renascent-Elements/relements/tree/main/docs/examples/frameworks/vue).
It wires `enhanceTabs` and `<re-tabs>` side by side, reads `event.detail.tabId`
via `@re-change`, and toggles the tabs component with `v-if` to demonstrate
`destroy()` on unmount.
