import { Component } from "@angular/core";
import { TabsComponent } from "./tabs.component";
import { MultiselectComponent } from "./multiselect.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [TabsComponent, MultiselectComponent],
  template: `
    <main style="padding: var(--re-space-8); max-width: 48rem; margin: 0 auto">
      <h1>Angular</h1>

      <p><button class="re-button" type="button">Save</button></p>

      <p>
        <button id="toggle" type="button" (click)="mounted = !mounted">Toggle demo</button>
      </p>

      @if (mounted) {
        <app-tabs />
        <app-multiselect />
      }
    </main>
  `,
})
export class AppComponent {
  mounted = true;
}
