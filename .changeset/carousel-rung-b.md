---
"@relements/core": minor
---

Carousel: add the zero-JS **CSS-Carousel** control rung (Rung B). Where the browser supports the CSS Carousel pseudo-elements (`scroll-marker-group`, `::scroll-marker`, `::scroll-button()` — Chrome 135+ today), `.re-carousel` now draws its dot strip and prev/next buttons with no JavaScript, styled to match the JS controls. `enhanceCarousel` feature-tests the same condition and stands down, so the two control sets never both appear (and a test asserts exactly one renders).

Shipped behind `@supports` and labeled **experimental**: the UA-generated markers/buttons are ahead of assistive tech (documented tab-exposure bugs), so the JS controls (Rung C) remain the accessibility-tested path on engines without the feature. Autoplay is still deferred to a later release.
