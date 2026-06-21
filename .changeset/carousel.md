---
"@relements/core": minor
---

Add **carousel** — a native CSS scroll-snap strip with the thinnest possible JS for controls.

- **`.re-carousel`** (CSS only) — `.re-carousel__track` is `overflow-x: auto` + `scroll-snap-type: inline mandatory`; it scrolls and snaps with zero JS (touch, trackpad, scrollbar, and Arrow/Page/Home/End since the track is a focusable scroll region). New export `@relements/core/components/carousel.css`.
- **`enhanceCarousel`** — back-fills the discoverable controls: prev/next buttons + a dot strip (plain buttons with `aria-label` / `aria-current`, **not** a tablist), active-slide tracking by box geometry (RTL-safe — no `scrollLeft`-sign math), end-disable (no wrap), `inert` on off-screen slides, and a debounced polite announcement of the settled slide. Navigation uses `scrollIntoView({ inline })` and honors `prefers-reduced-motion`. No custom event — derive the index from native `scroll`. New export `@relements/core/behaviors/carousel`.

This is the first rung: the CSS-Carousel pseudo-element rung (`::scroll-button()` / `::scroll-marker`, zero-JS controls) lands later behind `@supports` as experimental; autoplay is deferred. Dynamic slides are out of scope for now — re-run `enhanceCarousel` after mutating the slide list. Forced colors: the active dot uses `Highlight` and the controls get a real `ButtonText` border.
