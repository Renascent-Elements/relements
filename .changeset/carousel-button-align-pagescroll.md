---
"@relements/core": patch
---

Carousel fixes:

- **Autoplay no longer scrolls the page.** `enhanceCarousel`'s navigation centred the slide with `scrollIntoView()`, which scrolls _every_ ancestor — so an autoplaying carousel below the fold yanked the whole page down on each advance. It now scrolls only the track (centre offset computed from box geometry); native scroll-snap still drives touch/keyboard.
- **Centre the Rung B chevrons.** The CSS-Carousel `::scroll-button()` prev/next glyphs used the single guillemets (`‹`/`›`), which render off-centre in the button; switched to the `❮`/`❯` chevron ornaments (U+276E/U+276F).
