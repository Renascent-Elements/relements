import { useEffect, useRef, useState } from "react";
import { enhanceCarousel } from "@relements/core/behaviors/carousel";

export default function Carousel() {
  const wrapRef = useRef(null);
  const [renders, setRenders] = useState(0);

  useEffect(() => {
    // enhanceCarousel searches DESCENDANTS for [data-re-carousel], so enhance the
    // wrapper (not the host). It appends its controls — including the autoplay
    // pause button injected on every rung — as trailing CHILDREN of #car, a
    // position React never reconciles against this JSX, so they survive a
    // re-render instead of being reparented.
    const controller = enhanceCarousel(wrapRef.current);
    return () => controller.destroy();
  }, []);

  return (
    <section id="car-wrap" aria-labelledby="car-h" ref={wrapRef}>
      <h2 id="car-h">enhanceCarousel</h2>
      {/* Bumping `renders` re-renders this component (reconciling the carousel
          subtree) without unmounting it. */}
      <p>
        <button id="car-rerender" type="button" onClick={() => setRenders((n) => n + 1)}>
          Re-render
        </button>{" "}
        <output id="car-renders">{renders}</output> renders
      </p>
      <div className="re-carousel" id="car" data-re-carousel="" data-re-carousel-autoplay="100000">
        <div
          className="re-carousel__track"
          role="group"
          aria-roledescription="carousel"
          aria-label="Demo carousel"
          tabIndex={0}
        >
          <figure
            className="re-carousel__slide"
            aria-roledescription="slide"
            aria-label="Slide one"
          >
            One
          </figure>
          <figure
            className="re-carousel__slide"
            aria-roledescription="slide"
            aria-label="Slide two"
          >
            Two
          </figure>
          <figure
            className="re-carousel__slide"
            aria-roledescription="slide"
            aria-label="Slide three"
          >
            Three
          </figure>
        </div>
      </div>
    </section>
  );
}
