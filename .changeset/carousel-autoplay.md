---
"@relements/core": minor
---

Carousel: add **autoplay** (opt-in via `data-re-carousel-autoplay`; optional ms value, default 5000). `enhanceCarousel` injects an auto-advance timer plus a **Pause/Play button** — the WCAG 2.2.2 (Pause, Stop, Hide) stop mechanism — and pauses while the carousel is hovered, while focus is inside it, and while the tab is hidden. Under `prefers-reduced-motion: reduce` it starts paused, and it suppresses the live-region announcement while playing.

Autoplay runs on **either control rung** — the timer + pause button are JS even where the browser draws the dots/buttons itself (Rung B). The behavior's gate now skips only the _control injection_ on Rung B, not autoplay.
