---
title: Vue
description: Using Relements in a Vue app.
---

Import the stylesheet once at your app entry (e.g. `main.js`):

```js
import "@relements/core/index.css";
```

Then use native elements with Relements classes in your templates:

```vue
<button class="re-button" type="button">Save</button>
```

## Behaviors

Run a behavior like `enhanceTabs()` in `onMounted` against a template ref, and
call `controller.destroy()` in `onUnmounted`:

```vue
<script setup>
import { onMounted, onUnmounted, useTemplateRef } from "vue";
import { enhanceTabs } from "@relements/core/behaviors/tabs";

const enhanced = useTemplateRef("enhanced");
let controller = null;
onMounted(() => {
  controller = enhanceTabs(enhanced.value);
});
onUnmounted(() => controller?.destroy());
</script>
```

## Custom elements

Tell the Vue compiler to treat `re-*` tags as custom elements instead of trying
to resolve them as components. Set `isCustomElement` in `@vitejs/plugin-vue`:

```js
// vite.config.js
vue({
  template: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith("re-"),
    },
  },
});
```

Register the element once with its bare side-effect import:

```js
import "@relements/core/elements/re-tabs";
```

Then `<re-tabs>` works natively in templates. Bind its `re-change` `CustomEvent`
with `@re-change` and read `event.detail.tabId`:

```vue
<re-tabs @re-change="onChange">…</re-tabs>
```

See the runnable example in `docs/examples/frameworks/vue/`, or on
[GitHub](https://github.com/Renascent-Elements/relements/tree/main/docs/examples/frameworks/vue).
