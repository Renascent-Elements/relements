---
title: Angular
description: Using Relements in an Angular app.
---

Relements is [HTML-first and framework-agnostic](/relements/guides/behaviors-and-elements/):
the same `.re-*` classes, `data-*` attributes, `re-*` `CustomEvent`s, `enhance*`
behaviors, and `<re-*>` custom elements work in Angular with no wrappers — just
Angular's native primitives (a directive, event binding, `CUSTOM_ELEMENTS_SCHEMA`).

## Install and import the CSS

Add the package, then import the stylesheet once from your global
`src/styles.css` so the tokens, reset, and component layers load app-wide:

```css
/* src/styles.css */
@import "@relements/core/index.css";
```

That is the entire zero-JS baseline. Native elements with `.re-*` classes and
`data-*` attributes render styled in any template — no behavior, no custom
element, no JavaScript required:

```html
<button class="re-button" type="button">Save</button>
```

Bind `data-*` attributes the Angular way, with `[attr.data-…]`, so the value is
reflected to the DOM where the `enhance*` behaviors look for it:

```html
<dialog [attr.data-re-dialog-close-on-backdrop]="dismissable ? '' : null">…</dialog>
```

## Behaviors — a reusable `[reEnhance]` directive

A [behavior](/relements/guides/behaviors-and-elements/#the-enhance-pattern) is a
function `enhance*(el)` that wires a subtree and returns a controller with a
`destroy()` method. The idiomatic, reusable way to run that lifecycle in Angular
is an attribute **directive**: it grabs the host via `ElementRef`, calls the
behavior in `ngOnInit`, and tears down in `ngOnDestroy`.

```ts
// re-enhance.directive.ts
import { Directive, ElementRef, Input, OnDestroy, OnInit } from "@angular/core";

type Enhancer = (el: HTMLElement) => { destroy(): void };

@Directive({
  selector: "[reEnhance]",
  standalone: true,
})
export class ReEnhanceDirective implements OnInit, OnDestroy {
  @Input("reEnhance") enhance!: Enhancer;
  private controller?: { destroy(): void };

  constructor(private host: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.controller = this.enhance(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.controller?.destroy();
  }
}
```

Pass any `enhance*` function to it. Because behaviors are
[tree-shakable named exports](/relements/guides/behaviors-and-elements/#the-enhance-pattern),
import only the one you use, from its subpath:

```ts
import { Component } from "@angular/core";
import { enhanceTabs } from "@relements/core/behaviors/tabs";
import { ReEnhanceDirective } from "./re-enhance.directive";

@Component({
  selector: "app-tabs",
  standalone: true,
  imports: [ReEnhanceDirective],
  template: `
    <div class="re-tabs" data-re-tabs [reEnhance]="enhance">
      <div class="re-tabs__list" role="tablist" aria-label="Sections">
        <button class="re-tab" role="tab" id="t1" aria-controls="p1" aria-selected="true">
          One
        </button>
        <button
          class="re-tab"
          role="tab"
          id="t2"
          aria-controls="p2"
          aria-selected="false"
          tabindex="-1"
        >
          Two
        </button>
      </div>
      <section class="re-tabpanel" role="tabpanel" id="p1" aria-labelledby="t1" tabindex="0">
        Panel one
      </section>
      <section class="re-tabpanel" role="tabpanel" id="p2" aria-labelledby="t2" tabindex="0" hidden>
        Panel two
      </section>
    </div>
  `,
})
export class TabsComponent {
  // A reference, not a call — the directive invokes it on mount.
  enhance = enhanceTabs;
}
```

The directive runs `enhanceTabs(el)` when the element mounts and
`controller.destroy()` when Angular destroys it — for example when an `@if` or
`*ngIf` removes the host — so it works cleanly across mount/unmount cycles. Pull
any other behavior the same way: `enhanceCombobox`, `enhanceDialog`,
`enhanceMenuButton`, and the rest are listed in the
[behaviors & elements guide](/relements/guides/behaviors-and-elements/#the-behaviors).

If you would rather not write a directive, the equivalent inline form is a
`@ViewChild` element ref with `enhanceTabs()` in `ngOnInit` and
`controller.destroy()` in `ngOnDestroy` — the directive just makes that lifecycle
reusable across components.

## Events

`enhance*` behaviors and `<re-*>` elements emit bubbling `re-*`
[`CustomEvent`s](/relements/guides/behaviors-and-elements/). Listen with
Angular's native event binding; the `re-*` name goes straight in the parentheses.
Cast `$event` to `CustomEvent` to read its typed `detail`:

```html
<div class="re-tabs" data-re-tabs [reEnhance]="enhance" (re-change)="onChange($event)">…</div>
```

```ts
onChange(event: Event): void {
  const { tabId } = (event as CustomEvent<{ tabId: string }>).detail;
  this.lastTab = tabId;
}
```

The event bubbles, so you can also bind `(re-change)` on an ancestor. Each
behavior documents its event payload — e.g. tabs emits `re-change` with
`{ tabId, panelId }`; see the individual [component pages](/relements/components/tabs/).

## Custom elements

The five [`<re-*>` custom elements](/relements/guides/behaviors-and-elements/#custom-elements)
are light-DOM and self-register on import. Angular's template compiler rejects
unknown tag names by default, so add `CUSTOM_ELEMENTS_SCHEMA` to `schemas` to let
`<re-tabs>` (and friends) compile. In a standalone component the schema goes on
the `@Component` decorator; in a classic NgModule app it goes on the `@NgModule`:

```ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import "@relements/core/elements/re-tabs";

@Component({
  selector: "app-tabs",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <re-tabs aria-label="Sections" (re-change)="onChange($event)">
      <div class="re-tabs__list" role="tablist" aria-label="Sections">…</div>
      <section class="re-tabpanel" role="tabpanel" id="p1" aria-labelledby="t1" tabindex="0">
        …
      </section>
    </re-tabs>
  `,
})
export class TabsComponent {
  onChange(event: Event): void {
    this.lastTab = (event as CustomEvent<{ tabId: string }>).detail.tabId;
  }
}
```

The bare side-effect import registers the element via `customElements.define`;
`@relements/core` lists its `elements/*.js` modules under `sideEffects`, so the
registration survives bundler tree-shaking:

```ts
import "@relements/core/elements/re-tabs";
```

With the element registered and the schema in place, `<re-tabs>` enhances and
cleans itself up via its own `connectedCallback`/`disconnectedCallback` — no
directive needed — and re-dispatches `re-change`, which you bind exactly as
above. Set its `value` property to switch tabs programmatically (use
`[value]="…"` or a `@ViewChild`). The same pattern covers `<re-menu>`,
`<re-popover>`, and `<re-toast>`.

## Forms and native inputs

There is nothing special: `.re-input`, `.re-select`, `.re-checkbox` and the rest
are native `<input>`/`<select>` elements, so `[(ngModel)]` (or reactive forms via
`formControlName`) binds them with Angular's normal two-way data flow.

```html
<input class="re-input" type="email" name="email" [(ngModel)]="email" />
```

Form-input behaviors that commit through native `input`/`change` events — like
[`enhanceCombobox`](/relements/components/combobox/),
[`enhanceTagsInput`](/relements/components/tags-input/), and
[`enhanceNumberStepper`](/relements/components/number-stepper/) — flow into
`ngModel`/reactive forms unchanged; attach them with the `[reEnhance]` directive
above and bind the control as usual.

## Runnable example

**Try it now, no install** — open it in a live editor:

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/Renascent-Elements/relements/tree/main/docs/examples/frameworks/angular?file=src%2Fapp%2Fapp.component.ts)
[![Edit in CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/Renascent-Elements/relements/tree/main/docs/examples/frameworks/angular)

:::note[Stuck on "Cloning…"?]
An ad-blocker or privacy shield (Brave Shields, uBlock, …) can block StackBlitz's in-browser runtime. Open it in incognito, try another browser, or allowlist `stackblitz.com`.
:::

See the full working app — the `[reEnhance]` lifecycle, a `<re-tabs>` element
driving an `<output>` via `re-change`, `enhanceMultiSelect`, `enhanceCarousel`,
and `enhanceCommandPalette` controls (DOM-injecting, survive change detection),
and the "Toggle demo" button proving
`destroy()` runs on unmount — in `docs/examples/frameworks/angular/`, or on
[GitHub](https://github.com/Renascent-Elements/relements/tree/main/docs/examples/frameworks/angular).

## Related

- [Behaviors & custom elements](/relements/guides/behaviors-and-elements/) — the full `enhance*` and `<re-*>` reference.
- [Tabs](/relements/components/tabs/) — the component used throughout this recipe.
