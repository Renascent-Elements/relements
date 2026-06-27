import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { enhanceMultiSelect } from "@relements/core/behaviors/multiselect";

@Component({
  selector: "app-multiselect",
  standalone: true,
  template: `
    <section aria-labelledby="ms-h">
      <h2 id="ms-h">enhanceMultiSelect</h2>
      <!-- Above the field so the open (absolute) panel can't cover it; bumping
           \`renders\` runs change detection without unmounting. -->
      <p>
        <button id="ms-rerender" type="button" (click)="renders = renders + 1">Re-render</button>
        <output id="ms-renders">{{ renders }}</output> renders
      </p>
      <div class="re-field">
        <span class="re-field__label" id="ms-label">Frameworks</span>
        <div id="ms-wrap" #mswrap>
          <details class="re-multiselect" id="ms" data-re-multiselect>
            <summary class="re-multiselect__summary" aria-labelledby="ms-label ms-value">
              <span class="re-multiselect__value" id="ms-value" data-placeholder
                >Select frameworks</span
              >
            </summary>
            <fieldset class="re-multiselect__panel">
              <legend class="re-sr-only">Frameworks</legend>
              <label class="re-multiselect__option">
                <input type="checkbox" class="re-checkbox" name="fw" value="react" /> React
              </label>
              <label class="re-multiselect__option">
                <input type="checkbox" class="re-checkbox" name="fw" value="vue" /> Vue
              </label>
              <label class="re-multiselect__option">
                <input type="checkbox" class="re-checkbox" name="fw" value="svelte" /> Svelte
              </label>
            </fieldset>
          </details>
        </div>
      </div>
    </section>
  `,
})
export class MultiselectComponent implements OnInit, OnDestroy {
  // static:true resolves at ngOnInit because #mswrap is unconditional inside this
  // component (the @if gate lives in app.component, around <app-multiselect/>).
  @ViewChild("mswrap", { static: true }) wrap!: ElementRef<HTMLElement>;
  renders = 0;
  private controller: { destroy: () => void } | null = null;

  ngOnInit(): void {
    // Enhance the WRAPPER, not the <details>: the behavior injects its live region
    // as a sibling via host.after(), landing as a trailing child of #ms-wrap — a
    // node Angular doesn't manage — so change detection leaves it alone.
    this.controller = enhanceMultiSelect(this.wrap.nativeElement);
  }

  ngOnDestroy(): void {
    this.controller?.destroy();
  }
}
