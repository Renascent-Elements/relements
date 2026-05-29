import {
  AfterViewInit,
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
            <button
              class="re-tab"
              role="tab"
              id="e-tab-1"
              aria-controls="e-panel-1"
              aria-selected="true"
            >
              One
            </button>
            <button
              class="re-tab"
              role="tab"
              id="e-tab-2"
              aria-controls="e-panel-2"
              aria-selected="false"
              tabindex="-1"
            >
              Two
            </button>
            <button
              class="re-tab"
              role="tab"
              id="e-tab-3"
              aria-controls="e-panel-3"
              aria-selected="false"
              tabindex="-1"
            >
              Three
            </button>
          </div>
          <section
            class="re-tabpanel"
            role="tabpanel"
            id="e-panel-1"
            aria-labelledby="e-tab-1"
            tabindex="0"
          >
            Panel one
          </section>
          <section
            class="re-tabpanel"
            role="tabpanel"
            id="e-panel-2"
            aria-labelledby="e-tab-2"
            tabindex="0"
            hidden
          >
            Panel two
          </section>
          <section
            class="re-tabpanel"
            role="tabpanel"
            id="e-panel-3"
            aria-labelledby="e-tab-3"
            tabindex="0"
            hidden
          >
            Panel three
          </section>
        </div>
      </section>

      <section aria-labelledby="ce-h">
        <h2 id="ce-h">&lt;re-tabs&gt; custom element</h2>
        <re-tabs id="ce" #ce aria-label="Custom element" (re-change)="onChange($event)">
          <div class="re-tabs__list" role="tablist" aria-label="Custom element">
            <button
              class="re-tab"
              role="tab"
              id="c-tab-1"
              aria-controls="c-panel-1"
              aria-selected="true"
            >
              Alpha
            </button>
            <button
              class="re-tab"
              role="tab"
              id="c-tab-2"
              aria-controls="c-panel-2"
              aria-selected="false"
              tabindex="-1"
            >
              Beta
            </button>
            <button
              class="re-tab"
              role="tab"
              id="c-tab-3"
              aria-controls="c-panel-3"
              aria-selected="false"
              tabindex="-1"
            >
              Gamma
            </button>
          </div>
          <section
            class="re-tabpanel"
            role="tabpanel"
            id="c-panel-1"
            aria-labelledby="c-tab-1"
            tabindex="0"
          >
            Alpha panel
          </section>
          <section
            class="re-tabpanel"
            role="tabpanel"
            id="c-panel-2"
            aria-labelledby="c-tab-2"
            tabindex="0"
            hidden
          >
            Beta panel
          </section>
          <section
            class="re-tabpanel"
            role="tabpanel"
            id="c-panel-3"
            aria-labelledby="c-tab-3"
            tabindex="0"
            hidden
          >
            Gamma panel
          </section>
        </re-tabs>
        <p>
          Last tab: <output id="last-tab">{{ lastTab }}</output>
        </p>
      </section>
    </main>
  `,
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("enhanced", { static: true }) enhanced!: ElementRef<HTMLElement>;
  @ViewChild("ce", { static: true }) ce!: ElementRef<HTMLElement>;
  lastTab = "none";
  private controller: { destroy: () => void } | null = null;

  ngOnInit(): void {
    this.controller = enhanceTabs(this.enhanced.nativeElement);
  }

  ngAfterViewInit(): void {
    // Angular connects the <re-tabs> host to the DOM before projecting its
    // children, so the element's connectedCallback runs enhanceTabs() against
    // an empty host and wires nothing. Once the view (and the projected tabs)
    // exist, detach and re-attach the host so its disconnected/connected
    // lifecycle re-runs with the tab markup present.
    const host = this.ce.nativeElement;
    const parent = host.parentNode;
    const next = host.nextSibling;
    if (parent) {
      parent.removeChild(host);
      parent.insertBefore(host, next);
    }
  }

  ngOnDestroy(): void {
    this.controller?.destroy();
  }

  onChange(event: Event): void {
    this.lastTab = (event as CustomEvent<{ tabId: string }>).detail.tabId;
  }
}
