# Framework Examples Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the same canonical "one-flow" page in plain HTML, React, Vue, Svelte, and Angular — each consuming only the published `@relements/core` API (CSS classes + `--re-*` tokens, the `enhanceTabs` behavior, and the `<re-tabs>` custom element with its `re-change` event) — proving framework neutrality, with a Playwright smoke test per framework and documented caveats.

**Architecture:** Each framework gets a minimal runnable app under `docs/examples/frameworks/<fw>/` (Vite for React/Vue/Svelte, a hand-written minimal Angular CLI app), added to the pnpm workspace and depending on `@relements/core` via `workspace:*`. A `build:examples` script builds core then the four app builds; the existing `http-server` on :4173 serves the built `dist/` output, and one Playwright spec per framework asserts the identical contract via a shared helper. The plain-HTML reference needs no build (it imports core source like the existing examples).

**Tech Stack:** pnpm workspaces, Vite 6, React 19, Vue 3.5, Svelte 5, Angular 19, Playwright, Changesets.

---

## The canonical one-flow (shared by all five examples)

Every example renders this exact structure and produces comparable DOM. IDs are stable so one Playwright helper asserts all five.

1. **CSS surface** — `<button class="re-button" type="button">Save</button>` (class only, no JS).
2. **Behavior surface** — a plain tabs region `#enhanced` enhanced by `enhanceTabs(enhancedEl)`.
3. **Element/event surface** — a `<re-tabs id="ce">` custom element; a `re-change` listener on it writes `detail.tabId` into `<output id="last-tab">`.

`enhanceTabs` is scoped to the `#enhanced` element only (never `document`), so it does not double-enhance the `<re-tabs>` element (which enhances itself in `connectedCallback`).

The shared assertions are:
- `.re-button` is visible.
- Focusing `#e-tab-1` and pressing `ArrowRight` makes `#e-tab-2` the selected tab (`enhanceTabs` auto-selects on arrow keys).
- Clicking `#c-tab-2` inside `<re-tabs>` sets `<output id="last-tab">` text to `c-tab-2`.

---

## File structure

```
docs/examples/frameworks/
  _index.html                         # Task 1 — links to all five
  README.md                           # Task 1 — thesis, contract, how to run/test
  html/
    index.html                        # Task 2 — no-build reference (imports core src)
  react/
    package.json, vite.config.js,
    index.html, src/main.jsx, src/App.jsx, README.md   # Task 3
  vue/
    package.json, vite.config.js,
    index.html, src/main.js, src/App.vue, README.md     # Task 4
  svelte/
    package.json, vite.config.js,
    index.html, src/main.js, src/App.svelte, README.md  # Task 5
  angular/
    package.json, angular.json, tsconfig.json, tsconfig.app.json,
    src/index.html, src/main.ts, src/styles.css,
    src/app/app.component.ts, README.md                 # Task 6
tests/frameworks/
  _contract.ts                        # Task 2 — shared assertions
  html.spec.ts                        # Task 2
  react.spec.ts                       # Task 3
  vue.spec.ts                         # Task 4
  svelte.spec.ts                      # Task 5
  angular.spec.ts                     # Task 6
```

Modified: `pnpm-workspace.yaml`, root `package.json` (scripts), `.github/workflows/ci.yml`, `docs/examples/index.html`, plus a new changeset.

> **Note on versions:** the dependency versions below are known-good as of 2026-05. If `pnpm install` resolves a newer stable major for any framework, that is acceptable — adjust the caveat wording only if the framework's custom-element/event handling changed.

---

## Task 1: Workspace wiring, scripts, and frameworks index

**Files:**
- Modify: `pnpm-workspace.yaml`
- Modify: `package.json` (root, scripts)
- Create: `docs/examples/frameworks/README.md`
- Create: `docs/examples/frameworks/_index.html`

- [ ] **Step 1: Add the framework apps to the workspace**

Edit `pnpm-workspace.yaml` to:

```yaml
packages:
  - "packages/*"
  - "docs/examples/frameworks/*"

onlyBuiltDependencies:
  - esbuild
```

(`docs/examples/frameworks/html` has no `package.json`, so pnpm ignores it as a non-package directory.)

- [ ] **Step 2: Add the `build:examples` script**

In root `package.json`, add this entry to `"scripts"` (after the existing `"build"` line):

```json
    "build:examples": "pnpm -F @relements/core build && pnpm --filter \"./docs/examples/frameworks/*\" run build",
```

Core is built first so its `dist/` exists before the apps resolve `@relements/core` through its `exports` map.

- [ ] **Step 3: Create the frameworks README**

Create `docs/examples/frameworks/README.md`:

````markdown
# Framework examples

The same one-flow built in five stacks, each consuming **only** the published
`@relements/core` API — no framework-specific wrappers.

Every example renders:

- a `<button class="re-button">` — the **CSS class** surface;
- a tabs region enhanced by `enhanceTabs()` — the **behavior** surface
  (`re-change` event, `.destroy()` teardown);
- a `<re-tabs>` custom element whose `re-change` event updates an `<output>` —
  the **custom-element + event** surface.

The DOM, class names, `--re-*` tokens, and `re-change` event contract are identical
across all five. Only the framework glue differs.

## Run a single app

```bash
pnpm -F @relements/core build      # the apps consume core's dist/
cd docs/examples/frameworks/react  # or vue / svelte / angular
pnpm install
pnpm dev
```

The `html/` example needs no build — serve the repo root and open
`docs/examples/frameworks/html/index.html`.

## Build all examples (what CI does)

```bash
pnpm build:examples
```

Outputs each app to `docs/examples/frameworks/<fw>/dist/` (gitignored).

## Test

```bash
pnpm build:examples
pnpm exec playwright test tests/frameworks
```

## Per-framework caveats

| Framework | Custom element | Custom event (`re-change`) |
| --- | --- | --- |
| HTML | works as-is | `addEventListener('re-change', …)` |
| React | renders as-is (React 19) | no `onReChange` prop — `ref` + `addEventListener` in `useEffect` |
| Vue | needs `isCustomElement` compiler option | `@re-change` binds the native event |
| Svelte | works as-is | `onre-change={…}` (event attrs are case-sensitive) |
| Angular | needs `CUSTOM_ELEMENTS_SCHEMA` | `(re-change)="…($event)"` |

See each app's own README for details.
````

- [ ] **Step 4: Create the frameworks landing page**

Create `docs/examples/frameworks/_index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Relements · Framework examples</title>
    <link rel="stylesheet" href="/packages/core/src/index.css" />
    <style>
      body {
        padding: var(--re-space-8);
        max-width: 48rem;
        margin-inline: auto;
      }
      ul {
        line-height: 2;
      }
    </style>
  </head>
  <body data-page="frameworks-index">
    <main>
      <h1>Framework examples</h1>
      <p>
        The same one-flow (a <code>re-button</code>, an <code>enhanceTabs</code> region, and a
        <code>&lt;re-tabs&gt;</code> custom element) built with no wrappers in five stacks.
      </p>
      <nav aria-label="Framework examples">
        <ul>
          <li><a href="./html/index.html">Plain HTML</a> — no build</li>
          <li><a href="./react/dist/index.html">React</a> — run <code>pnpm build:examples</code> first</li>
          <li><a href="./vue/dist/index.html">Vue</a> — run <code>pnpm build:examples</code> first</li>
          <li><a href="./svelte/dist/index.html">Svelte</a> — run <code>pnpm build:examples</code> first</li>
          <li><a href="./angular/dist/index.html">Angular</a> — run <code>pnpm build:examples</code> first</li>
        </ul>
      </nav>
      <p>See <code>README.md</code> in this folder for setup and caveats.</p>
    </main>
  </body>
</html>
```

- [ ] **Step 5: Commit**

```bash
git add pnpm-workspace.yaml package.json docs/examples/frameworks/README.md docs/examples/frameworks/_index.html
git commit -m "chore(examples): scaffold frameworks workspace + build:examples script"
```

---

## Task 2: Shared contract helper + plain-HTML reference + html spec

This task is done first because the HTML example needs no build, and it establishes the shared Playwright helper that every later spec reuses.

**Files:**
- Create: `docs/examples/frameworks/html/index.html`
- Create: `tests/frameworks/_contract.ts`
- Create: `tests/frameworks/html.spec.ts`

- [ ] **Step 1: Write the shared contract helper**

Create `tests/frameworks/_contract.ts`:

```ts
import { expect, type Page } from "@playwright/test";

/**
 * Asserts the canonical one-flow contract on an already-loaded page:
 * CSS class surface, enhanceTabs behavior surface, and the <re-tabs>
 * custom-element + re-change event surface.
 */
export async function assertContract(page: Page): Promise<void> {
  // CSS surface
  await expect(page.locator(".re-button")).toBeVisible();

  // Behavior surface: arrow keys move + select within the enhanced region.
  await page.locator("#e-tab-1").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#e-tab-2")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#e-tab-1")).toHaveAttribute("aria-selected", "false");

  // Element + event surface: clicking a re-tabs tab fires re-change and the
  // listener writes detail.tabId into <output>.
  await page.locator("#c-tab-2").click();
  await expect(page.locator("#last-tab")).toHaveText("c-tab-2");
}
```

- [ ] **Step 2: Write the plain-HTML reference example**

Create `docs/examples/frameworks/html/index.html`. This mirrors the existing examples' convention of importing core source directly (no build):

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Relements · HTML framework example</title>
    <link rel="stylesheet" href="/packages/core/src/index.css" />
    <style>
      body {
        padding: var(--re-space-8);
        max-width: 48rem;
        margin-inline: auto;
      }
      section {
        margin-block: var(--re-space-6);
      }
      .re-tabpanel {
        padding: var(--re-space-4);
        background-color: var(--re-color-bg-subtle);
        border-radius: var(--re-radius-md);
      }
    </style>
  </head>
  <body data-page="frameworks-html">
    <h1>Plain HTML</h1>

    <p><button class="re-button" type="button">Save</button></p>

    <section aria-labelledby="enh-h">
      <h2 id="enh-h">enhanceTabs</h2>
      <div class="re-tabs" data-re-tabs id="enhanced">
        <div class="re-tabs__list" role="tablist" aria-label="Enhanced">
          <button class="re-tab" role="tab" id="e-tab-1" aria-controls="e-panel-1" aria-selected="true">One</button>
          <button class="re-tab" role="tab" id="e-tab-2" aria-controls="e-panel-2" aria-selected="false" tabindex="-1">Two</button>
          <button class="re-tab" role="tab" id="e-tab-3" aria-controls="e-panel-3" aria-selected="false" tabindex="-1">Three</button>
        </div>
        <section class="re-tabpanel" role="tabpanel" id="e-panel-1" aria-labelledby="e-tab-1" tabindex="0">Panel one</section>
        <section class="re-tabpanel" role="tabpanel" id="e-panel-2" aria-labelledby="e-tab-2" tabindex="0" hidden>Panel two</section>
        <section class="re-tabpanel" role="tabpanel" id="e-panel-3" aria-labelledby="e-tab-3" tabindex="0" hidden>Panel three</section>
      </div>
    </section>

    <section aria-labelledby="ce-h">
      <h2 id="ce-h">&lt;re-tabs&gt; custom element</h2>
      <re-tabs id="ce" aria-label="Custom element">
        <div class="re-tabs__list" role="tablist" aria-label="Custom element">
          <button class="re-tab" role="tab" id="c-tab-1" aria-controls="c-panel-1" aria-selected="true">Alpha</button>
          <button class="re-tab" role="tab" id="c-tab-2" aria-controls="c-panel-2" aria-selected="false" tabindex="-1">Beta</button>
          <button class="re-tab" role="tab" id="c-tab-3" aria-controls="c-panel-3" aria-selected="false" tabindex="-1">Gamma</button>
        </div>
        <section class="re-tabpanel" role="tabpanel" id="c-panel-1" aria-labelledby="c-tab-1" tabindex="0">Alpha panel</section>
        <section class="re-tabpanel" role="tabpanel" id="c-panel-2" aria-labelledby="c-tab-2" tabindex="0" hidden>Beta panel</section>
        <section class="re-tabpanel" role="tabpanel" id="c-panel-3" aria-labelledby="c-tab-3" tabindex="0" hidden>Gamma panel</section>
      </re-tabs>
      <p>Last tab: <output id="last-tab">none</output></p>
    </section>

    <script type="module">
      import { enhanceTabs } from "/packages/core/src/behaviors/tabs.js";
      import "/packages/core/src/elements/re-tabs.js";

      enhanceTabs(document.getElementById("enhanced"));

      document.getElementById("ce").addEventListener("re-change", (event) => {
        document.getElementById("last-tab").textContent = event.detail.tabId;
      });
    </script>
  </body>
</html>
```

- [ ] **Step 3: Write the html spec (it should fail until the file is served)**

Create `tests/frameworks/html.spec.ts`:

```ts
import { test } from "@playwright/test";
import { assertContract } from "./_contract";

test("html example satisfies the relements contract", async ({ page }) => {
  await page.goto("/docs/examples/frameworks/html/index.html");
  await assertContract(page);
});
```

- [ ] **Step 4: Run the html spec — verify it passes**

The `baseURL` in `playwright.config.ts` is `http://localhost:4173/docs/examples/`, and the spec uses an absolute server path, so `http-server` serves it directly. No build needed.

Run: `pnpm exec playwright test tests/frameworks/html.spec.ts`
Expected: 1 passed.

(If you want to confirm the helper actually exercises the contract, temporarily break the script's event listener and re-run — it should fail on the `#last-tab` assertion — then revert.)

- [ ] **Step 5: Commit**

```bash
git add tests/frameworks/_contract.ts tests/frameworks/html.spec.ts docs/examples/frameworks/html/index.html
git commit -m "feat(examples): plain-HTML framework reference + shared Playwright contract"
```

---

## Task 3: React example

**Files:**
- Create: `docs/examples/frameworks/react/package.json`
- Create: `docs/examples/frameworks/react/vite.config.js`
- Create: `docs/examples/frameworks/react/index.html`
- Create: `docs/examples/frameworks/react/src/main.jsx`
- Create: `docs/examples/frameworks/react/src/App.jsx`
- Create: `docs/examples/frameworks/react/README.md`
- Create: `tests/frameworks/react.spec.ts`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "@relements-example/react",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "@relements/core": "workspace:*",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.0"
  }
}
```

- [ ] **Step 2: Create `vite.config.js`**

`base: "./"` makes built asset URLs relative so the app works when served from a subdirectory.

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
});
```

- [ ] **Step 3: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Relements · React example</title>
  </head>
  <body data-page="frameworks-react">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Create `src/main.jsx`**

```jsx
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

- [ ] **Step 5: Create `src/App.jsx`**

React has no declarative prop for a custom event like `re-change`, so we bind it with a `ref` + `addEventListener`. `enhanceTabs` runs in the same effect and is torn down with `destroy()`.

```jsx
import { useEffect, useRef, useState } from "react";
import { enhanceTabs } from "@relements/core/behaviors/tabs";
import "@relements/core/elements/re-tabs";

export default function App() {
  const enhancedRef = useRef(null);
  const ceRef = useRef(null);
  const [lastTab, setLastTab] = useState("none");

  useEffect(() => {
    const controller = enhanceTabs(enhancedRef.current);
    const el = ceRef.current;
    const onChange = (event) => setLastTab(event.detail.tabId);
    el.addEventListener("re-change", onChange);
    return () => {
      controller.destroy();
      el.removeEventListener("re-change", onChange);
    };
  }, []);

  return (
    <main style={{ padding: "var(--re-space-8)", maxWidth: "48rem", margin: "0 auto" }}>
      <h1>React</h1>

      <p>
        <button className="re-button" type="button">
          Save
        </button>
      </p>

      <section aria-labelledby="enh-h">
        <h2 id="enh-h">enhanceTabs</h2>
        <div className="re-tabs" data-re-tabs id="enhanced" ref={enhancedRef}>
          <div className="re-tabs__list" role="tablist" aria-label="Enhanced">
            <button className="re-tab" role="tab" id="e-tab-1" aria-controls="e-panel-1" aria-selected="true">One</button>
            <button className="re-tab" role="tab" id="e-tab-2" aria-controls="e-panel-2" aria-selected="false" tabIndex={-1}>Two</button>
            <button className="re-tab" role="tab" id="e-tab-3" aria-controls="e-panel-3" aria-selected="false" tabIndex={-1}>Three</button>
          </div>
          <section className="re-tabpanel" role="tabpanel" id="e-panel-1" aria-labelledby="e-tab-1" tabIndex={0}>Panel one</section>
          <section className="re-tabpanel" role="tabpanel" id="e-panel-2" aria-labelledby="e-tab-2" tabIndex={0} hidden>Panel two</section>
          <section className="re-tabpanel" role="tabpanel" id="e-panel-3" aria-labelledby="e-tab-3" tabIndex={0} hidden>Panel three</section>
        </div>
      </section>

      <section aria-labelledby="ce-h">
        <h2 id="ce-h">&lt;re-tabs&gt; custom element</h2>
        <re-tabs id="ce" ref={ceRef} aria-label="Custom element">
          <div className="re-tabs__list" role="tablist" aria-label="Custom element">
            <button className="re-tab" role="tab" id="c-tab-1" aria-controls="c-panel-1" aria-selected="true">Alpha</button>
            <button className="re-tab" role="tab" id="c-tab-2" aria-controls="c-panel-2" aria-selected="false" tabIndex={-1}>Beta</button>
            <button className="re-tab" role="tab" id="c-tab-3" aria-controls="c-panel-3" aria-selected="false" tabIndex={-1}>Gamma</button>
          </div>
          <section className="re-tabpanel" role="tabpanel" id="c-panel-1" aria-labelledby="c-tab-1" tabIndex={0}>Alpha panel</section>
          <section className="re-tabpanel" role="tabpanel" id="c-panel-2" aria-labelledby="c-tab-2" tabIndex={0} hidden>Beta panel</section>
          <section className="re-tabpanel" role="tabpanel" id="c-panel-3" aria-labelledby="c-tab-3" tabIndex={0} hidden>Gamma panel</section>
        </re-tabs>
        <p>Last tab: <output id="last-tab">{lastTab}</output></p>
      </section>
    </main>
  );
}
```

- [ ] **Step 6: Create `src/README.md`** at `docs/examples/frameworks/react/README.md`

````markdown
# React example

```bash
pnpm -F @relements/core build
pnpm install
pnpm dev      # or: pnpm build
```

## Caveats

- **Custom events:** React provides no `onReChange` prop for the `re-change`
  `CustomEvent`. Get a `ref` to the `<re-tabs>` element and
  `addEventListener('re-change', …)` inside `useEffect`, returning the
  `removeEventListener` for cleanup.
- **Behavior lifecycle:** call `enhanceTabs(ref.current)` in `useEffect` and
  return `controller.destroy()` so it tears down on unmount (and on every
  `StrictMode` remount in development).
- **Custom elements:** React 19 renders unknown tags like `<re-tabs>` and passes
  string attributes through, so the light-DOM markup just works.
````

- [ ] **Step 7: Write the React spec**

Create `tests/frameworks/react.spec.ts`:

```ts
import { test } from "@playwright/test";
import { assertContract } from "./_contract";

test("react example satisfies the relements contract", async ({ page }) => {
  await page.goto("/docs/examples/frameworks/react/dist/index.html");
  await assertContract(page);
});
```

- [ ] **Step 8: Install, build, and run the spec**

```bash
pnpm install
pnpm -F @relements/core build
pnpm -F @relements-example/react build
pnpm exec playwright test tests/frameworks/react.spec.ts
```

Expected: `react/dist/index.html` is produced and the spec reports 1 passed.

- [ ] **Step 9: Commit**

```bash
git add docs/examples/frameworks/react tests/frameworks/react.spec.ts pnpm-lock.yaml
git commit -m "feat(examples): React framework example + smoke test"
```

---

## Task 4: Vue example

**Files:**
- Create: `docs/examples/frameworks/vue/package.json`
- Create: `docs/examples/frameworks/vue/vite.config.js`
- Create: `docs/examples/frameworks/vue/index.html`
- Create: `docs/examples/frameworks/vue/src/main.js`
- Create: `docs/examples/frameworks/vue/src/App.vue`
- Create: `docs/examples/frameworks/vue/README.md`
- Create: `tests/frameworks/vue.spec.ts`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "@relements-example/vue",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "@relements/core": "workspace:*",
    "vue": "^3.5.13"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.1",
    "vite": "^6.0.0"
  }
}
```

- [ ] **Step 2: Create `vite.config.js`**

The `isCustomElement` option tells the Vue compiler that `re-*` tags are custom elements, not Vue components (otherwise it warns "Failed to resolve component").

```js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  base: "./",
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

- [ ] **Step 3: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Relements · Vue example</title>
  </head>
  <body data-page="frameworks-vue">
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 4: Create `src/main.js`**

```js
import { createApp } from "vue";
import "@relements/core/index.css";
import App from "./App.vue";

createApp(App).mount("#app");
```

- [ ] **Step 5: Create `src/App.vue`**

Vue attaches a native `addEventListener` for `@re-change` on a custom element, so the event binds declaratively. Lifecycle uses `onMounted`/`onUnmounted`.

```vue
<script setup>
import { onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import { enhanceTabs } from "@relements/core/behaviors/tabs";
import "@relements/core/elements/re-tabs";

const enhanced = useTemplateRef("enhanced");
const lastTab = ref("none");
let controller = null;

function onChange(event) {
  lastTab.value = event.detail.tabId;
}

onMounted(() => {
  controller = enhanceTabs(enhanced.value);
});
onUnmounted(() => {
  controller?.destroy();
});
</script>

<template>
  <main style="padding: var(--re-space-8); max-width: 48rem; margin: 0 auto">
    <h1>Vue</h1>

    <p><button class="re-button" type="button">Save</button></p>

    <section aria-labelledby="enh-h">
      <h2 id="enh-h">enhanceTabs</h2>
      <div class="re-tabs" data-re-tabs id="enhanced" ref="enhanced">
        <div class="re-tabs__list" role="tablist" aria-label="Enhanced">
          <button class="re-tab" role="tab" id="e-tab-1" aria-controls="e-panel-1" aria-selected="true">One</button>
          <button class="re-tab" role="tab" id="e-tab-2" aria-controls="e-panel-2" aria-selected="false" :tabindex="-1">Two</button>
          <button class="re-tab" role="tab" id="e-tab-3" aria-controls="e-panel-3" aria-selected="false" :tabindex="-1">Three</button>
        </div>
        <section class="re-tabpanel" role="tabpanel" id="e-panel-1" aria-labelledby="e-tab-1" :tabindex="0">Panel one</section>
        <section class="re-tabpanel" role="tabpanel" id="e-panel-2" aria-labelledby="e-tab-2" :tabindex="0" hidden>Panel two</section>
        <section class="re-tabpanel" role="tabpanel" id="e-panel-3" aria-labelledby="e-tab-3" :tabindex="0" hidden>Panel three</section>
      </div>
    </section>

    <section aria-labelledby="ce-h">
      <h2 id="ce-h">&lt;re-tabs&gt; custom element</h2>
      <re-tabs id="ce" aria-label="Custom element" @re-change="onChange">
        <div class="re-tabs__list" role="tablist" aria-label="Custom element">
          <button class="re-tab" role="tab" id="c-tab-1" aria-controls="c-panel-1" aria-selected="true">Alpha</button>
          <button class="re-tab" role="tab" id="c-tab-2" aria-controls="c-panel-2" aria-selected="false" :tabindex="-1">Beta</button>
          <button class="re-tab" role="tab" id="c-tab-3" aria-controls="c-panel-3" aria-selected="false" :tabindex="-1">Gamma</button>
        </div>
        <section class="re-tabpanel" role="tabpanel" id="c-panel-1" aria-labelledby="c-tab-1" :tabindex="0">Alpha panel</section>
        <section class="re-tabpanel" role="tabpanel" id="c-panel-2" aria-labelledby="c-tab-2" :tabindex="0" hidden>Beta panel</section>
        <section class="re-tabpanel" role="tabpanel" id="c-panel-3" aria-labelledby="c-tab-3" :tabindex="0" hidden>Gamma panel</section>
      </re-tabs>
      <p>Last tab: <output id="last-tab">{{ lastTab }}</output></p>
    </section>
  </main>
</template>
```

- [ ] **Step 6: Create `README.md`** at `docs/examples/frameworks/vue/README.md`

````markdown
# Vue example

```bash
pnpm -F @relements/core build
pnpm install
pnpm dev      # or: pnpm build
```

## Caveats

- **Custom elements:** set `compilerOptions.isCustomElement: (tag) => tag.startsWith('re-')`
  in `@vitejs/plugin-vue` so Vue treats `<re-tabs>` as a DOM element instead of
  trying to resolve a component.
- **Custom events:** `@re-change="onChange"` binds the native `re-change`
  `CustomEvent`; read `event.detail.tabId`.
- **Behavior lifecycle:** run `enhanceTabs(ref)` in `onMounted` and call
  `controller.destroy()` in `onUnmounted`.
````

- [ ] **Step 7: Write the Vue spec**

Create `tests/frameworks/vue.spec.ts`:

```ts
import { test } from "@playwright/test";
import { assertContract } from "./_contract";

test("vue example satisfies the relements contract", async ({ page }) => {
  await page.goto("/docs/examples/frameworks/vue/dist/index.html");
  await assertContract(page);
});
```

- [ ] **Step 8: Install, build, and run the spec**

```bash
pnpm install
pnpm -F @relements/core build
pnpm -F @relements-example/vue build
pnpm exec playwright test tests/frameworks/vue.spec.ts
```

Expected: 1 passed.

- [ ] **Step 9: Commit**

```bash
git add docs/examples/frameworks/vue tests/frameworks/vue.spec.ts pnpm-lock.yaml
git commit -m "feat(examples): Vue framework example + smoke test"
```

---

## Task 5: Svelte example

**Files:**
- Create: `docs/examples/frameworks/svelte/package.json`
- Create: `docs/examples/frameworks/svelte/vite.config.js`
- Create: `docs/examples/frameworks/svelte/index.html`
- Create: `docs/examples/frameworks/svelte/src/main.js`
- Create: `docs/examples/frameworks/svelte/src/App.svelte`
- Create: `docs/examples/frameworks/svelte/README.md`
- Create: `tests/frameworks/svelte.spec.ts`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "@relements-example/svelte",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "@relements/core": "workspace:*"
  },
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^5.0.3",
    "svelte": "^5.16.0",
    "vite": "^6.0.0"
  }
}
```

- [ ] **Step 2: Create `vite.config.js`**

```js
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  base: "./",
  plugins: [svelte()],
});
```

- [ ] **Step 3: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Relements · Svelte example</title>
  </head>
  <body data-page="frameworks-svelte">
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 4: Create `src/main.js`**

```js
import { mount } from "svelte";
import "@relements/core/index.css";
import App from "./App.svelte";

mount(App, { target: document.getElementById("app") });
```

- [ ] **Step 5: Create `src/App.svelte`**

In Svelte 5 any `on`-prefixed attribute is an event listener and event names are case-sensitive, so `onre-change={onChange}` binds the native `re-change` event. `onMount` returns the teardown.

```svelte
<script>
  import { onMount } from "svelte";
  import { enhanceTabs } from "@relements/core/behaviors/tabs";
  import "@relements/core/elements/re-tabs";

  let enhanced;
  let lastTab = $state("none");

  function onChange(event) {
    lastTab = event.detail.tabId;
  }

  onMount(() => {
    const controller = enhanceTabs(enhanced);
    return () => controller.destroy();
  });
</script>

<main style="padding: var(--re-space-8); max-width: 48rem; margin: 0 auto">
  <h1>Svelte</h1>

  <p><button class="re-button" type="button">Save</button></p>

  <section aria-labelledby="enh-h">
    <h2 id="enh-h">enhanceTabs</h2>
    <div class="re-tabs" data-re-tabs id="enhanced" bind:this={enhanced}>
      <div class="re-tabs__list" role="tablist" aria-label="Enhanced">
        <button class="re-tab" role="tab" id="e-tab-1" aria-controls="e-panel-1" aria-selected="true">One</button>
        <button class="re-tab" role="tab" id="e-tab-2" aria-controls="e-panel-2" aria-selected="false" tabindex="-1">Two</button>
        <button class="re-tab" role="tab" id="e-tab-3" aria-controls="e-panel-3" aria-selected="false" tabindex="-1">Three</button>
      </div>
      <section class="re-tabpanel" role="tabpanel" id="e-panel-1" aria-labelledby="e-tab-1" tabindex="0">Panel one</section>
      <section class="re-tabpanel" role="tabpanel" id="e-panel-2" aria-labelledby="e-tab-2" tabindex="0" hidden>Panel two</section>
      <section class="re-tabpanel" role="tabpanel" id="e-panel-3" aria-labelledby="e-tab-3" tabindex="0" hidden>Panel three</section>
    </div>
  </section>

  <section aria-labelledby="ce-h">
    <h2 id="ce-h">&lt;re-tabs&gt; custom element</h2>
    <re-tabs id="ce" aria-label="Custom element" onre-change={onChange}>
      <div class="re-tabs__list" role="tablist" aria-label="Custom element">
        <button class="re-tab" role="tab" id="c-tab-1" aria-controls="c-panel-1" aria-selected="true">Alpha</button>
        <button class="re-tab" role="tab" id="c-tab-2" aria-controls="c-panel-2" aria-selected="false" tabindex="-1">Beta</button>
        <button class="re-tab" role="tab" id="c-tab-3" aria-controls="c-panel-3" aria-selected="false" tabindex="-1">Gamma</button>
      </div>
      <section class="re-tabpanel" role="tabpanel" id="c-panel-1" aria-labelledby="c-tab-1" tabindex="0">Alpha panel</section>
      <section class="re-tabpanel" role="tabpanel" id="c-panel-2" aria-labelledby="c-tab-2" tabindex="0" hidden>Beta panel</section>
      <section class="re-tabpanel" role="tabpanel" id="c-panel-3" aria-labelledby="c-tab-3" tabindex="0" hidden>Gamma panel</section>
    </re-tabs>
    <p>Last tab: <output id="last-tab">{lastTab}</output></p>
  </section>
</main>
```

- [ ] **Step 6: Create `README.md`** at `docs/examples/frameworks/svelte/README.md`

````markdown
# Svelte example

```bash
pnpm -F @relements/core build
pnpm install
pnpm dev      # or: pnpm build
```

## Caveats

- **Custom elements:** `<re-tabs>` renders as-is; Svelte does not validate unknown
  tag names.
- **Custom events:** in Svelte 5 any `on`-prefixed attribute is a listener and
  event names are case-sensitive, so `onre-change={onChange}` listens for the
  `re-change` `CustomEvent`. Read `event.detail.tabId`.
- **Behavior lifecycle:** run `enhanceTabs(node)` in `onMount` and return
  `() => controller.destroy()` for teardown.
````

- [ ] **Step 7: Write the Svelte spec**

Create `tests/frameworks/svelte.spec.ts`:

```ts
import { test } from "@playwright/test";
import { assertContract } from "./_contract";

test("svelte example satisfies the relements contract", async ({ page }) => {
  await page.goto("/docs/examples/frameworks/svelte/dist/index.html");
  await assertContract(page);
});
```

- [ ] **Step 8: Install, build, and run the spec**

```bash
pnpm install
pnpm -F @relements/core build
pnpm -F @relements-example/svelte build
pnpm exec playwright test tests/frameworks/svelte.spec.ts
```

Expected: 1 passed.

- [ ] **Step 9: Commit**

```bash
git add docs/examples/frameworks/svelte tests/frameworks/svelte.spec.ts pnpm-lock.yaml
git commit -m "feat(examples): Svelte framework example + smoke test"
```

---

## Task 6: Angular example

This is a minimal hand-written standalone Angular app (no `ng new` boilerplate, no test runner).

**Files:**
- Create: `docs/examples/frameworks/angular/package.json`
- Create: `docs/examples/frameworks/angular/angular.json`
- Create: `docs/examples/frameworks/angular/tsconfig.json`
- Create: `docs/examples/frameworks/angular/tsconfig.app.json`
- Create: `docs/examples/frameworks/angular/src/index.html`
- Create: `docs/examples/frameworks/angular/src/main.ts`
- Create: `docs/examples/frameworks/angular/src/styles.css`
- Create: `docs/examples/frameworks/angular/src/app/app.component.ts`
- Create: `docs/examples/frameworks/angular/README.md`
- Create: `tests/frameworks/angular.spec.ts`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "@relements-example/angular",
  "private": true,
  "version": "0.0.0",
  "scripts": {
    "dev": "ng serve",
    "build": "ng build"
  },
  "dependencies": {
    "@relements/core": "workspace:*",
    "@angular/common": "^19.0.0",
    "@angular/compiler": "^19.0.0",
    "@angular/core": "^19.0.0",
    "@angular/platform-browser": "^19.0.0",
    "rxjs": "^7.8.0",
    "tslib": "^2.8.0",
    "zone.js": "^0.15.0"
  },
  "devDependencies": {
    "@angular/build": "^19.0.0",
    "@angular/cli": "^19.0.0",
    "@angular/compiler-cli": "^19.0.0",
    "typescript": "~5.6.0"
  }
}
```

- [ ] **Step 2: Create `angular.json`**

`baseHref: "./"` and the flattened `outputPath` make the build land at `dist/index.html` with relative asset URLs, matching the other apps' served path.

```json
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "projects": {
    "angular": {
      "projectType": "application",
      "root": "",
      "sourceRoot": "src",
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "outputPath": { "base": "dist", "browser": "" },
            "baseHref": "./",
            "index": "src/index.html",
            "browser": "src/main.ts",
            "tsConfig": "tsconfig.app.json",
            "styles": ["src/styles.css"]
          }
        },
        "serve": {
          "builder": "@angular/build:dev-server",
          "options": { "buildTarget": "angular:build" }
        }
      }
    }
  }
}
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "strict": true,
    "module": "preserve",
    "moduleResolution": "bundler",
    "target": "ES2022",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "lib": ["ES2022", "DOM"]
  },
  "angularCompilerOptions": {
    "strictTemplates": true
  }
}
```

- [ ] **Step 4: Create `tsconfig.app.json`**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": []
  },
  "files": ["src/main.ts"]
}
```

- [ ] **Step 5: Create `src/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Relements · Angular example</title>
  </head>
  <body data-page="frameworks-angular">
    <app-root></app-root>
  </body>
</html>
```

- [ ] **Step 6: Create `src/styles.css`**

```css
@import "@relements/core/index.css";
```

> If Angular's stylesheet pipeline fails to resolve the bare `@import` specifier,
> fall back to adding the resolved file path to the `styles` array in
> `angular.json` instead.

- [ ] **Step 7: Create `src/main.ts`**

```ts
import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";

bootstrapApplication(AppComponent).catch((err) => console.error(err));
```

- [ ] **Step 8: Create `src/app/app.component.ts`**

`CUSTOM_ELEMENTS_SCHEMA` lets templates use `<re-tabs>`. `(re-change)="onChange($event)"` binds the native event. Lifecycle uses `ngOnInit`/`ngOnDestroy`.

```ts
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { enhanceTabs } from "@relements/core/behaviors/tabs";
import "@relements/core/elements/re-tabs";

@Component({
  selector: "app-root",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <main style="padding: var(--re-space-8); max-width: 48rem; margin: 0 auto">
      <h1>Angular</h1>

      <p><button class="re-button" type="button">Save</button></p>

      <section aria-labelledby="enh-h">
        <h2 id="enh-h">enhanceTabs</h2>
        <div class="re-tabs" data-re-tabs id="enhanced" #enhanced>
          <div class="re-tabs__list" role="tablist" aria-label="Enhanced">
            <button class="re-tab" role="tab" id="e-tab-1" aria-controls="e-panel-1" aria-selected="true">One</button>
            <button class="re-tab" role="tab" id="e-tab-2" aria-controls="e-panel-2" aria-selected="false" tabindex="-1">Two</button>
            <button class="re-tab" role="tab" id="e-tab-3" aria-controls="e-panel-3" aria-selected="false" tabindex="-1">Three</button>
          </div>
          <section class="re-tabpanel" role="tabpanel" id="e-panel-1" aria-labelledby="e-tab-1" tabindex="0">Panel one</section>
          <section class="re-tabpanel" role="tabpanel" id="e-panel-2" aria-labelledby="e-tab-2" tabindex="0" hidden>Panel two</section>
          <section class="re-tabpanel" role="tabpanel" id="e-panel-3" aria-labelledby="e-tab-3" tabindex="0" hidden>Panel three</section>
        </div>
      </section>

      <section aria-labelledby="ce-h">
        <h2 id="ce-h">&lt;re-tabs&gt; custom element</h2>
        <re-tabs id="ce" aria-label="Custom element" (re-change)="onChange($event)">
          <div class="re-tabs__list" role="tablist" aria-label="Custom element">
            <button class="re-tab" role="tab" id="c-tab-1" aria-controls="c-panel-1" aria-selected="true">Alpha</button>
            <button class="re-tab" role="tab" id="c-tab-2" aria-controls="c-panel-2" aria-selected="false" tabindex="-1">Beta</button>
            <button class="re-tab" role="tab" id="c-tab-3" aria-controls="c-panel-3" aria-selected="false" tabindex="-1">Gamma</button>
          </div>
          <section class="re-tabpanel" role="tabpanel" id="c-panel-1" aria-labelledby="c-tab-1" tabindex="0">Alpha panel</section>
          <section class="re-tabpanel" role="tabpanel" id="c-panel-2" aria-labelledby="c-tab-2" tabindex="0" hidden>Beta panel</section>
          <section class="re-tabpanel" role="tabpanel" id="c-panel-3" aria-labelledby="c-tab-3" tabindex="0" hidden>Gamma panel</section>
        </re-tabs>
        <p>Last tab: <output id="last-tab">{{ lastTab }}</output></p>
      </section>
    </main>
  `,
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild("enhanced", { static: true }) enhanced!: ElementRef<HTMLElement>;
  lastTab = "none";
  private controller: { destroy: () => void } | null = null;

  ngOnInit(): void {
    this.controller = enhanceTabs(this.enhanced.nativeElement);
  }

  ngOnDestroy(): void {
    this.controller?.destroy();
  }

  onChange(event: Event): void {
    this.lastTab = (event as CustomEvent<{ tabId: string }>).detail.tabId;
  }
}
```

- [ ] **Step 9: Create `README.md`** at `docs/examples/frameworks/angular/README.md`

````markdown
# Angular example

```bash
pnpm -F @relements/core build
pnpm install
pnpm dev      # or: pnpm build
```

## Caveats

- **Custom elements:** add `CUSTOM_ELEMENTS_SCHEMA` to the component's `schemas`
  so Angular allows `<re-tabs>` in the template.
- **Custom events:** `(re-change)="onChange($event)"` binds the native
  `re-change` `CustomEvent`; cast `$event` to `CustomEvent` to read
  `detail.tabId`.
- **Behavior lifecycle:** run `enhanceTabs(el.nativeElement)` in `ngOnInit` and
  call `controller.destroy()` in `ngOnDestroy`.
- **Global CSS:** import `@relements/core/index.css` from `src/styles.css`.
````

- [ ] **Step 10: Write the Angular spec**

Create `tests/frameworks/angular.spec.ts`:

```ts
import { test } from "@playwright/test";
import { assertContract } from "./_contract";

test("angular example satisfies the relements contract", async ({ page }) => {
  await page.goto("/docs/examples/frameworks/angular/dist/index.html");
  await assertContract(page);
});
```

- [ ] **Step 11: Install, build, and run the spec**

```bash
pnpm install
pnpm -F @relements/core build
pnpm -F @relements-example/angular build
pnpm exec playwright test tests/frameworks/angular.spec.ts
```

Expected: `angular/dist/index.html` exists and the spec reports 1 passed. If the build output is nested under `dist/browser/`, update `outputPath` flattening in `angular.json` (Step 2) until `dist/index.html` is produced.

- [ ] **Step 12: Commit**

```bash
git add docs/examples/frameworks/angular tests/frameworks/angular.spec.ts pnpm-lock.yaml
git commit -m "feat(examples): Angular framework example + smoke test"
```

---

## Task 7: CI wiring, examples index link, and changeset

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `docs/examples/index.html`
- Create: `.changeset/<generated-name>.md`

- [ ] **Step 1: Build examples before Playwright in CI**

In `.github/workflows/ci.yml`, in the `e2e` job, add a build step immediately **before** the `- run: pnpm test:browser` line:

```yaml
      - run: pnpm build:examples
      - run: pnpm test:browser
```

(The framework specs read each app's built `dist/`; the html spec needs no build.)

- [ ] **Step 2: Link the frameworks index from the main examples index**

In `docs/examples/index.html`, add this list item as the first child of the `<ul>` inside `<nav aria-label="Examples">`:

```html
          <li><a href="./frameworks/_index.html">Framework examples — React, Vue, Svelte, Angular</a></li>
```

- [ ] **Step 3: Create the changeset**

Create `.changeset/framework-examples.md` (the exact filename is unimportant; `pnpm changeset` would generate a random one — this fixed name is fine):

```markdown
---
"@relements/core": patch
---

docs: add framework usage examples (HTML, React, Vue, Svelte, Angular) proving the published CSS/behavior/custom-element API works with no framework wrappers.
```

- [ ] **Step 4: Verify the changeset is valid**

Run: `pnpm exec changeset status`
Expected: it lists `@relements/core` with a patch bump and no errors.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/ci.yml docs/examples/index.html .changeset/framework-examples.md
git commit -m "ci(examples): build framework apps before e2e + changeset + index link"
```

---

## Task 8: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Lint**

Run: `pnpm lint`
Expected: prettier + eslint pass. If prettier flags generated example files, run `pnpm format` and re-commit.

- [ ] **Step 2: Full example build**

Run: `pnpm build:examples`
Expected: core builds, then `react`, `vue`, `svelte`, `angular` each produce `docs/examples/frameworks/<fw>/dist/index.html`.

- [ ] **Step 3: Full framework test sweep**

Run: `pnpm exec playwright test tests/frameworks`
Expected: 5 passed (html, react, vue, svelte, angular).

- [ ] **Step 4: Existing suite still green**

Run: `pnpm test:browser`
Expected: the original example specs plus the 5 framework specs all pass (this run rebuilds nothing, so ensure Step 2 ran first).

- [ ] **Step 5: Confirm built output is gitignored**

Run: `git status --porcelain docs/examples/frameworks`
Expected: no `dist/` paths appear (covered by the existing `**/dist/` rule in `.gitignore`).

- [ ] **Step 6: Final commit (if any formatting changes)**

```bash
git add -A
git commit -m "chore(examples): formatting + verification"
```

---

## Self-review notes

- **Spec coverage:** CSS/behavior/custom-element surfaces → canonical flow in Tasks 2–6; runnable Vite/CLI apps consuming `workspace:*` → Tasks 3–6; reuse of http-server + `base:'./'` → each vite.config/angular.json; smoke tests via shared helper → `_contract.ts` + 5 specs; gitignored built output → existing `**/dist/`; changeset added → Task 7; per-framework caveats → each README + frameworks README table; parallel `frameworks/html/` baseline → Task 2.
- **Type consistency:** the controller shape `{ destroy: () => void }` matches `enhanceTabs`'s return across all apps; `assertContract(page)` signature is identical in all five specs; event detail is `{ tabId: string }` everywhere; stable IDs (`re-button` class, `#e-tab-1..3`, `#c-tab-1..3`, `#last-tab`) are reused verbatim by the helper and every app.
- **Known risk flagged inline:** Angular build output nesting (Task 6, Step 11) and Angular bare-`@import` CSS resolution (Task 6, Step 6) each carry a fallback.
