import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { enhanceCarousel } from "@relements/core/behaviors/carousel";

@Component({
  selector: "app-carousel",
  standalone: true,
  template: `
    <section id="car-wrap" aria-labelledby="car-h" #carwrap>
      <h2 id="car-h">enhanceCarousel</h2>
      <!-- Bumping \`renders\` runs change detection without unmounting. -->
      <p>
        <button id="car-rerender" type="button" (click)="renders = renders + 1">Re-render</button>
        <output id="car-renders">{{ renders }}</output> renders
      </p>
      <div class="re-carousel" id="car" data-re-carousel data-re-carousel-autoplay="100000">
        <div
          class="re-carousel__track"
          role="group"
          aria-roledescription="carousel"
          aria-label="Demo carousel"
          tabindex="0"
        >
          <figure class="re-carousel__slide" aria-roledescription="slide" aria-label="Slide one">
            One
          </figure>
          <figure class="re-carousel__slide" aria-roledescription="slide" aria-label="Slide two">
            Two
          </figure>
          <figure class="re-carousel__slide" aria-roledescription="slide" aria-label="Slide three">
            Three
          </figure>
        </div>
      </div>
    </section>
  `,
})
export class CarouselComponent implements OnInit, OnDestroy {
  // enhanceCarousel searches descendants for [data-re-carousel]; its controls
  // append as trailing CHILDREN of #car, a position Angular's change detection
  // never reconciles against the template, so they survive a re-render.
  @ViewChild("carwrap", { static: true }) wrap!: ElementRef<HTMLElement>;
  renders = 0;
  private controller: { destroy: () => void } | null = null;

  ngOnInit(): void {
    this.controller = enhanceCarousel(this.wrap.nativeElement);
  }

  ngOnDestroy(): void {
    this.controller?.destroy();
  }
}
