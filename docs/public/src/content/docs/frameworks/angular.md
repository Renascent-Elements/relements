---
title: Angular
description: Using Relements in an Angular app.
---

Import the stylesheet once from your global `src/styles.css`:

```css
@import "@relements/core/index.css";
```

Then use native elements with Relements classes in your templates:

```html
<button class="re-button" type="button">Save</button>
```

## Behaviors

Run a behavior like `enhanceTabs()` in `ngOnInit` against a `@ViewChild`
element, and call `controller.destroy()` in `ngOnDestroy`:

```ts
import { enhanceTabs } from "@relements/core/behaviors/tabs";

@ViewChild("enhanced") enhanced!: ElementRef;
private controller?: { destroy(): void };

ngOnInit() {
  this.controller = enhanceTabs(this.enhanced.nativeElement);
}
ngOnDestroy() {
  this.controller?.destroy();
}
```

## Custom elements

Angular rejects unknown tags by default, so add `CUSTOM_ELEMENTS_SCHEMA` to the
component's `schemas` to allow `<re-tabs>` in its template. The example uses a
standalone component, so the schema goes on the `@Component` decorator (in a
classic NgModule app it would go on the `@NgModule` instead):

```ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

@Component({
  selector: "app-tabs",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `…`,
})
export class TabsComponent {}
```

Register the element once with its bare side-effect import:

```ts
import "@relements/core/elements/re-tabs";
```

Bind the `re-change` `CustomEvent` with Angular's native event syntax and cast
`$event` to `CustomEvent` to read `detail.tabId`:

```html
<re-tabs (re-change)="onChange($event)">…</re-tabs>
```

See the runnable example in `docs/examples/frameworks/angular/`, or on
[GitHub](https://github.com/Renascent-Elements/relements/tree/main/docs/examples/frameworks/angular).
