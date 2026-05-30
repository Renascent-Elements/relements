import { Component } from "@angular/core";
import { TabsComponent } from "./tabs.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [TabsComponent],
  template: `
    <main style="padding: var(--re-space-8); max-width: 48rem; margin: 0 auto">
      <h1>Angular</h1>

      <p><button class="re-button" type="button">Save</button></p>

      <p>
        <button id="toggle" type="button" (click)="mounted = !mounted">Toggle tabs</button>
      </p>

      @if (mounted) {
        <app-tabs />
      }
    </main>
  `,
})
export class AppComponent {
  mounted = true;
}
