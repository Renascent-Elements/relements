---
title: Behaviors & custom elements
description: Optional JavaScript layers — enhance* behaviors and <re-*> custom elements — over native HTML.
---

Relements is [HTML-first](/relements/guides/html-first/): the foundation is semantic markup plus CSS, and **JavaScript is optional**. When a component needs interaction beyond what native HTML and CSS provide, you opt into one of two JS layers — an **`enhance*` behavior** or a **`<re-*>` custom element**. Both progressively enhance markup that already works without them; neither is required for base functionality.

## The `enhance*` pattern

Every behavior follows the same contract:

- A single function, `enhance*(root = document)`, that scans `root` for its `data-re-*` hosts and wires them.
- It returns a controller — `{ destroy() }` — that removes every listener it added.
- It is **idempotent**: re-running it over an already-enhanced subtree is a no-op, guarded per host (typically a `data-re-*-ready` marker).
- It is a **tree-shakable named ESM export**, available both from the root and from a per-behavior subpath (e.g. `@relements/core/behaviors/tabs`), so you only ship the behaviors you import.
- It is **fully typed** (each module ships a `.d.ts`), and `root` may be a `Document`, `Element`, or `ShadowRoot`.
- Where it emits events, they are bubbling `CustomEvent`s prefixed `re-*` (e.g. `re-change`, `re-select`, `re-dismiss`), so any framework can listen with `addEventListener`.

```js
import { enhanceTabs } from "@relements/core/behaviors/tabs";

// Wire every [data-re-tabs] host under document.
const controller = enhanceTabs(document);

document.addEventListener("re-change", (e) => {
  console.log(e.detail); // { tabId, panelId }
});

// Later — remove all listeners this call added.
controller.destroy();
```

Passing a narrower `root` scopes the enhancement; this is how framework components enhance just their own subtree on mount and `destroy()` on unmount:

```js
const controller = enhanceTabs(myComponentRoot);
// onUnmount → controller.destroy();
```

### Progressive enhancement, not a requirement

Behaviors never own the markup — they layer over HTML that already works. The native baseline keeps working with **zero JavaScript**:

- A `<dialog>` opens, closes, and traps focus natively; `enhanceDialog` only adds ergonomics like a trigger button and backdrop-click dismissal.
- A `<textarea data-autosize>` is a normal resizable textarea (and modern browsers grow it in pure CSS via `field-sizing: content`); `enhanceAutosize` is a no-op fallback for engines without it.
- `<re-popover>` / `enhancePopover` feature-detect the Popover API and bail out gracefully where it is absent (see [Browser support](/relements/guides/browser-support/)).
- A combobox stays a native `<input list>` + `<datalist>`; the password toggle button is authored `hidden` and only un-hidden by JS, so no dead control is ever shown.

### Declarative `data-re-*` hooks

Because behaviors find their hosts by `data-re-*` attributes rather than by imperative wiring, a single global init can enhance a whole page with **no per-page JavaScript** — you just author the right attributes. The documentation site does exactly this: its client init (`src/client/enhance.ts`) imports the behaviors once and runs each over `document`, so any demo that is written declaratively becomes interactive on the site without an inline script.

```html
<!-- No page script needed — a global enhanceDialog wires this. -->
<button type="button" data-re-dialog-trigger data-re-dialog-target="confirm">Open</button>
<dialog id="confirm" data-re-dialog-close-on-backdrop>
  …
  <button data-re-dialog-close value="cancel">Cancel</button>
</dialog>
```

Genuinely imperative APIs have no declarative form. [`showToast`](/relements/components/toast/) is a function you call, not markup you author, so the docs site wires demo buttons with a docs-only hook and shows the real `showToast(...)` call alongside.

## The behaviors

All 19 behaviors are exported by name from `@relements/core` and from `@relements/core/behaviors/<name>`.

### Overlays & menus

- **`enhanceDialog`** — ergonomics for native `<dialog>`: `data-re-dialog-trigger`/`-target` to open, `data-re-dialog-close` buttons, optional backdrop-click and `data-re-dialog-no-dismiss`. Native `showModal`/Escape/focus stay native. See [Dialog](/relements/components/dialog/), [Alert dialog](/relements/components/alert-dialog/), [Drawer](/relements/components/drawer/).
- **`enhanceMenuButton`** — the ARIA menu-button pattern (toggle, roving focus, typeahead, outside-click close); emits `re-select` (`{ item, value }`). See [Menu button](/relements/components/menu-button/).
- **`enhancePopover`** — anchored positioning for native `[popover]` and a `re-toggle` event mirroring the native `toggle`. No-ops without the Popover API. See [Popover](/relements/components/popover/).
- **`enhanceContextMenu`** — opens a styled `role="menu"` at the pointer on right-click (and ContextMenu key / Shift+F10); emits `re-select`. Falls back to the native browser menu with no JS. See [Context menu](/relements/components/context-menu/).
- **`enhanceCommandPalette`** — turns a `<dialog>` into a filterable command launcher (combobox/listbox ARIA, type-to-filter, optional hotkey); emits `re-command`. Reuses `enhanceDialog` for the modal lifecycle. See [Command palette](/relements/components/command-palette/).

### Navigation & roving focus

- **`enhanceTabs`** — the ARIA tabs pattern with automatic activation and Arrow/Home/End keys; emits `re-change` (`{ tabId, panelId }`). See [Tabs](/relements/components/tabs/).
- **`enhanceToolbar`** — collapses a `role="toolbar"` to one Tab stop with Arrow-key roving; composes with a hosted menu. See [Toolbar](/relements/components/toolbar/).
- **`enhanceCarousel`** — back-fills prev/next + a dot strip over a native CSS scroll-snap track (`.re-carousel`), tracks the active slide by box geometry (RTL-safe), inerts off-screen slides, and announces the settled slide. No custom event — derive the index from native `scroll`. See [Carousel](/relements/components/carousel/).

### Form inputs

- **`enhanceCombobox`** — a styled `role="listbox"` over a native `<input list>` + `<datalist>`; case-insensitive filtering and the ARIA editable-combobox pattern. Commits dispatch native `input`/`change`. See [Combobox](/relements/components/combobox/).
- **`enhanceNumberStepper`** — wires large +/− buttons to a native number input (native `stepUp`/`stepDown`, then `input`/`change`). See [Number stepper](/relements/components/number-stepper/).
- **`enhancePasswordToggle`** — a show/hide button that flips a password field's `type` and reflects `aria-pressed`; preserves caret. See [Password toggle](/relements/components/password-toggle/).
- **`enhanceAutosize`** — grows a `.re-textarea[data-autosize]` with its content; a no-op where CSS `field-sizing: content` is supported. See [Autosize textarea](/relements/components/autosize-textarea/).
- **`enhanceOtp`** — autofill-safe polish for a one-time-code input (active-cell hook, optional digit-strip); never splits the field. See [OTP](/relements/components/otp/).
- **`enhanceTagsInput`** — turns a text input into a token/chip editor that submits an array; emits `re-tags-change` (`{ values }`) + `change`. See [Tags input](/relements/components/tags-input/).
- **`enhanceRating`** — normalizes arrow-key direction in a star-rating radio group across browsers. See [Rating](/relements/components/rating/).
- **`enhanceRange`** — turns two overlaid range inputs into a two-thumb min–max slider; no custom events (native `input`/`change` bubble). See [Range](/relements/components/range/).
- **`enhanceFilePicker`** — echoes the filenames, wires drag-and-drop, clear, and `accept`/size/count validation over a `.re-file-picker`; the native input stays the form value. Emits `re-error` on a rejected drop (value changes use native `change`). See [File picker](/relements/components/file-picker/).

### Dismissal & notifications

- **`enhanceDismissible`** — `[data-re-dismiss]` buttons hide their `[data-re-dismissible]` ancestor; emits cancelable `re-dismiss`. See [Banner](/relements/components/banner/), [Alert](/relements/components/alert/).
- **`showToast(message, options)`** — imperative; appends a toast to a `[data-re-toast-region]` (creating one on `document.body` if absent) and returns `{ dismiss, element }`. Not an `enhance*` function — there is no markup to wire. See [Toast](/relements/components/toast/).

## Custom elements

Four `<re-*>` custom elements wrap the behaviors above for consumers who prefer a tag over an imperative call. They are:

- **Light-DOM only** — no Shadow DOM. Your markup stays in the light tree, so component CSS, page styles, forms, and `querySelector` all work normally.
- **Self-registering on import** — importing the module calls `customElements.define()` as a side effect. Import each element you use; `package.json` lists `elements/*.js` under `sideEffects` so bare imports survive tree-shaking (see [HTML-first policy](/relements/guides/html-first/)).
- **The same class/attribute/event contract** — on connect, each host applies its own `.re-*` class and `data-re-*` marker, then runs its behavior over itself and tears down on disconnect. The element re-dispatches the behavior's `re-*` events, so the HTML and the custom-element APIs converge.

```js
import "@relements/core/elements/re-tabs";
```

| Element                                                  | Wraps               | Exposes                                                                                                                                        |
| -------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| [`<re-tabs>`](/relements/custom-elements/re-tabs/)       | `enhanceTabs`       | `value` property (selected tab id; set to switch); re-dispatches `re-change`. Observes children so frameworks that project late still enhance. |
| [`<re-menu>`](/relements/custom-elements/re-menu/)       | `enhanceMenuButton` | `open` boolean property; re-dispatches `re-select`.                                                                                            |
| [`<re-popover>`](/relements/custom-elements/re-popover/) | `enhancePopover`    | `show()` / `hide()` / `toggle()` methods; `open` property (reflects `:popover-open`). Adds the native `popover` attribute on connect.          |
| [`<re-toast>`](/relements/custom-elements/re-toast/)     | `showToast`         | `.show(message, options)` method scoped to its own region; materializes a `.re-toast-region` on connect.                                       |

## Behavior vs custom element — which to reach for

Both wire the same logic; pick by integration style.

**Reach for a behavior when** you want to enhance existing markup imperatively and control the lifecycle yourself — a global page init, a framework component enhancing its own subtree on mount and calling `destroy()` on unmount, or scoping enhancement to a `ShadowRoot`. Behaviors are also the only option for the form inputs and dismissal helpers, which have no custom-element wrapper.

**Reach for a custom element when** you want a declarative, self-managing tag — drop `<re-tabs>` into any template and it enhances and cleans itself up via `connectedCallback`/`disconnectedCallback`, no init call to remember. It is the natural fit for plain HTML pages and for frameworks that render custom elements directly. The five elements wrap tabs, menu, popover, toast, and the file picker; everything else is behavior-only.

Either way the underlying markup is the same semantic HTML, so you can start with one and switch later without changing the document's structure.

## Related

- [HTML-first policy](/relements/guides/html-first/) — why JS is an optional layer.
- [Browser support](/relements/guides/browser-support/) — what degrades gracefully where a platform feature is missing.
- [Versioning](/relements/guides/versioning/) — `re-*` events, `data-re-*` hooks, and `<re-*>` tags are public API.
