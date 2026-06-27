/**
 * enhanceCarousel
 * ---------------
 * The thin JS layer over a `.re-carousel` whose `__track` is a native CSS
 * scroll-snap strip (Rung A — scrolls + snaps with zero JS). This behavior:
 *
 *   - (Rung C) where the browser does NOT draw the CSS-Carousel controls itself,
 *     injects prev/next buttons + a dot strip (plain `<button>`s with `aria-label`
 *     + `aria-current`), tracks the active slide by rect centre-distance (RTL-safe),
 *     marks prev/next `aria-disabled` at the ends (kept focusable, not removed),
 *     inerts off-screen slides, and politely announces the settled slide;
 *   - (autoplay, opt-in via `data-re-carousel-autoplay`) auto-advances on a timer
 *     with a real Pause/Play button (WCAG 2.2.2), pausing on hover, focus-within,
 *     and a hidden tab, and starting PAUSED under `prefers-reduced-motion`.
 *
 * Where the browser DOES draw the controls (Rung B — the CSS Carousel pseudo-
 * elements, Chrome 135+), the control injection stands down (the CSS `@supports`
 * uses the same feature test), but autoplay still runs if requested — it's
 * orthogonal to who draws the dots/buttons.
 *
 * Navigation uses `scrollIntoView({ inline: "center" })` (logical axis → RTL free)
 * and honors `prefers-reduced-motion`. No custom event — derive the index from
 * the native `scroll`. Dynamic slides are out of scope: re-run after mutating.
 *
 *   <div class="re-carousel" data-re-carousel data-re-carousel-autoplay="5000">
 *     <div class="re-carousel__track" role="group" aria-roledescription="carousel"
 *          aria-label="Photos" tabindex="0">
 *       <figure class="re-carousel__slide" aria-roledescription="slide"
 *               aria-label="Sunset">…</figure>
 *       …
 *     </div>
 *   </div>
 *
 * @typedef {{ destroy: () => void }} Controller
 */

const SVG_NS = "http://www.w3.org/2000/svg";

/** A base 24×24 decorative SVG. */
function svgEl(doc) {
  const svg = doc.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  return svg;
}
/** Left-pointing chevron (stroked). */
function chevron(doc) {
  const svg = svgEl(doc);
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  const poly = doc.createElementNS(SVG_NS, "polyline");
  poly.setAttribute("points", "15 18 9 12 15 6");
  svg.appendChild(poly);
  return svg;
}
/** Pause glyph (two bars). */
function pauseIcon(doc) {
  const svg = svgEl(doc);
  for (const x of ["8", "13"]) {
    const r = doc.createElementNS(SVG_NS, "rect");
    r.setAttribute("x", x);
    r.setAttribute("y", "6");
    r.setAttribute("width", "3");
    r.setAttribute("height", "12");
    r.setAttribute("fill", "currentColor");
    svg.appendChild(r);
  }
  return svg;
}
/** Play glyph (triangle). */
function playIcon(doc) {
  const svg = svgEl(doc);
  const tri = doc.createElementNS(SVG_NS, "polygon");
  tri.setAttribute("points", "8 5 19 12 8 19");
  tri.setAttribute("fill", "currentColor");
  svg.appendChild(tri);
  return svg;
}

/** True where the browser draws the CSS-Carousel markers/buttons itself (Rung B). */
function nativeControls() {
  return (
    typeof CSS !== "undefined" &&
    CSS.supports("(scroll-marker-group: after) and selector(::scroll-marker)")
  );
}

/** Autoplay interval in ms (default 5000), or null if not opted in. */
function autoplayMsOf(host) {
  if (!host.hasAttribute("data-re-carousel-autoplay")) return null;
  const n = parseInt(host.getAttribute("data-re-carousel-autoplay") ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : 5000;
}

/**
 * @param {Document | Element | ShadowRoot} [root=document]
 * @returns {Controller}
 */
export function enhanceCarousel(root = document) {
  if (root == null) {
    throw new TypeError("enhanceCarousel: root must be a Document, Element, or ShadowRoot");
  }
  /** @type {Array<() => void>} */
  const cleanups = [];
  const wire = (host) => cleanups.push(wireOne(/** @type {HTMLElement} */ (host)));

  if (root instanceof Element && root.matches?.("[data-re-carousel]")) wire(root);
  root.querySelectorAll("[data-re-carousel]").forEach(wire);

  return {
    destroy() {
      while (cleanups.length) cleanups.pop()?.();
    },
  };
}

/**
 * @param {HTMLElement} host
 * @returns {() => void}
 */
function wireOne(host) {
  if (host.hasAttribute("data-re-carousel-ready")) return () => {}; // idempotent
  const track = /** @type {HTMLElement | null} */ (host.querySelector(".re-carousel__track"));
  if (!track) return () => {};
  const slides = /** @type {HTMLElement[]} */ (
    Array.from(track.querySelectorAll(".re-carousel__slide"))
  );
  if (slides.length < 2) return () => {};

  // Inject the dots/prev/next only where the UA doesn't draw them (Rung B = no).
  const controls = !nativeControls();
  const autoplayMs = autoplayMsOf(host);
  // Nothing for the behavior to do: the UA draws the controls AND no autoplay.
  if (!controls && autoplayMs == null) return () => {};
  host.setAttribute("data-re-carousel-ready", "");

  const doc = host.ownerDocument;
  const win = doc.defaultView ?? window;
  const reduce = () => win.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** Active = the slide whose box centre is closest to the track's centre. */
  const activeIndex = () => {
    const box = track.getBoundingClientRect();
    const center = (box.left + box.right) / 2;
    let best = 0;
    let bestDist = Infinity;
    slides.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      const dist = Math.abs((r.left + r.right) / 2 - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    return best;
  };
  const nav = (i) => {
    const target = Math.max(0, Math.min(slides.length - 1, i));
    // Centre the slide WITHIN the track's own scroll only. scrollIntoView() would
    // also scroll every ancestor — so an autoplaying carousel below the fold yanks
    // the whole page down on each advance. Compute the centre offset from box
    // geometry and scroll just the track. (Native scroll-snap still drives
    // touch/keyboard/RTL; this is only the prev/next + dot + autoplay path.)
    const trackBox = track.getBoundingClientRect();
    const slideBox = slides[target].getBoundingClientRect();
    const delta = slideBox.left - trackBox.left - (trackBox.width - slideBox.width) / 2;
    track.scrollTo({ left: track.scrollLeft + delta, behavior: reduce() ? "auto" : "smooth" });
  };

  /** @type {Array<() => void>} */
  const teardown = [];

  // ---- Rung C controls -------------------------------------------------
  /** @type {HTMLButtonElement | undefined} */ let prev;
  /** @type {HTMLButtonElement | undefined} */ let next;
  /** @type {HTMLElement | undefined} */ let live;
  /** @type {HTMLButtonElement[]} */ let dots = [];
  if (controls) {
    const control = (dir, label) => {
      const b = doc.createElement("button");
      b.type = "button";
      b.className = "re-carousel__control";
      b.dataset.dir = dir;
      b.setAttribute("aria-label", label);
      b.appendChild(chevron(doc));
      return b;
    };
    prev = control("prev", "Previous slide");
    next = control("next", "Next slide");
    // aria-disabled (not the `disabled` property) keeps the end button focusable
    // and in the a11y tree (APG), so guard the handler instead of the browser.
    const onPrev = () => {
      if (prev?.getAttribute("aria-disabled") !== "true") nav(activeIndex() - 1);
    };
    const onNext = () => {
      if (next?.getAttribute("aria-disabled") !== "true") nav(activeIndex() + 1);
    };
    prev.addEventListener("click", onPrev);
    next.addEventListener("click", onNext);

    const dotsWrap = doc.createElement("div");
    dotsWrap.className = "re-carousel__dots";
    dots = slides.map((_, i) => {
      const d = doc.createElement("button");
      d.type = "button";
      d.className = "re-carousel__dot";
      d.setAttribute("aria-label", `Go to slide ${i + 1}`);
      d.addEventListener("click", () => nav(i));
      dotsWrap.appendChild(d);
      return d;
    });

    live = doc.createElement("div");
    live.className = "re-sr-only";
    live.setAttribute("aria-live", "polite");

    host.append(prev, next, dotsWrap, live);
    teardown.push(() => {
      prev.removeEventListener("click", onPrev);
      next.removeEventListener("click", onNext);
      prev.remove();
      next.remove();
      dotsWrap.remove();
      live.remove();
    });
  }

  // ---- Autoplay (opt-in) ----------------------------------------------
  let hovered = false;
  let focusWithin = false;
  // Start paused under reduced motion; otherwise play.
  let userPlaying = autoplayMs != null && !reduce();
  const isPlaying = () =>
    autoplayMs != null && userPlaying && !hovered && !focusWithin && !doc.hidden;
  if (autoplayMs != null) {
    const pauseBtn = doc.createElement("button");
    pauseBtn.type = "button";
    pauseBtn.className = "re-carousel__autoplay";
    let timer = 0;
    // The icon/label depend ONLY on userPlaying, so rebuild them only when it
    // changes. Rebuilding on hover/focus would swap the icon between mousedown and
    // mouseup of a real click (focusin fires in between) and the click would never
    // land. The timer, by contrast, reacts to every transient pause.
    const syncButton = () => {
      pauseBtn.setAttribute(
        "aria-label",
        userPlaying ? "Pause automatic slideshow" : "Play automatic slideshow",
      );
      pauseBtn.replaceChildren(userPlaying ? pauseIcon(doc) : playIcon(doc));
    };
    const syncTimer = () => {
      const run = isPlaying();
      if (run && !timer) {
        timer = win.setInterval(() => nav((activeIndex() + 1) % slides.length), autoplayMs);
      } else if (!run && timer) {
        win.clearInterval(timer);
        timer = 0;
      }
    };
    const onToggle = () => {
      userPlaying = !userPlaying;
      syncButton();
      syncTimer();
      // Pausing settles on the current slide with no scroll event to drive the
      // usual announce — so announce here (isPlaying() is now false, so it runs).
      if (!userPlaying) announce();
    };
    const onEnter = () => ((hovered = true), syncTimer());
    const onLeave = () => ((hovered = false), syncTimer());
    const onFocusIn = () => ((focusWithin = true), syncTimer());
    const onFocusOut = (e) => {
      if (!host.contains(/** @type {Node | null} */ (e.relatedTarget))) {
        focusWithin = false;
        syncTimer();
      }
    };
    const onVis = () => syncTimer();
    pauseBtn.addEventListener("click", onToggle);
    host.addEventListener("mouseenter", onEnter);
    host.addEventListener("mouseleave", onLeave);
    host.addEventListener("focusin", onFocusIn);
    host.addEventListener("focusout", onFocusOut);
    doc.addEventListener("visibilitychange", onVis);
    host.appendChild(pauseBtn);
    teardown.push(() => {
      pauseBtn.removeEventListener("click", onToggle);
      host.removeEventListener("mouseenter", onEnter);
      host.removeEventListener("mouseleave", onLeave);
      host.removeEventListener("focusin", onFocusIn);
      host.removeEventListener("focusout", onFocusOut);
      doc.removeEventListener("visibilitychange", onVis);
      if (timer) win.clearInterval(timer);
      pauseBtn.remove();
    });
    syncButton();
    syncTimer();
  }

  // ---- Shared bookkeeping ---------------------------------------------
  // A slide is reachable only while it overlaps the track viewport; inert the
  // rest. Geometry-based, so it works for ANY slide-per-view count — the old
  // index check silently did nothing once more than one slide showed at a time.
  const overlapsTrack = (s) => {
    const sb = s.getBoundingClientRect();
    const tb = track.getBoundingClientRect();
    return Math.min(sb.right, tb.right) - Math.max(sb.left, tb.left) > 1;
  };
  const update = () => {
    const active = activeIndex();
    if (controls) {
      /** @type {HTMLButtonElement} */ (prev).setAttribute("aria-disabled", String(active <= 0));
      /** @type {HTMLButtonElement} */ (next).setAttribute(
        "aria-disabled",
        String(active >= slides.length - 1),
      );
      dots.forEach((d, i) => d.setAttribute("aria-current", String(i === active)));
    }
    slides.forEach((s) => (s.inert = !overlapsTrack(s)));
  };
  const announce = () => {
    if (!controls || !live) return; // no live region on Rung B
    if (isPlaying()) return; // don't narrate auto-advances
    const i = activeIndex();
    const name = slides[i].getAttribute("aria-label");
    live.textContent = name
      ? `${name} (${i + 1} of ${slides.length})`
      : `Slide ${i + 1} of ${slides.length}`;
  };

  let raf = 0;
  let announceTimer = 0;
  const onScroll = () => {
    if (!raf) raf = win.requestAnimationFrame(() => ((raf = 0), update()));
    win.clearTimeout(announceTimer);
    announceTimer = win.setTimeout(announce, 150);
  };
  track.addEventListener("scroll", onScroll, { passive: true });

  /** @type {ResizeObserver | undefined} */
  let ro;
  if ("ResizeObserver" in win) {
    ro = new win.ResizeObserver(() => update());
    ro.observe(track);
  } else {
    win.addEventListener("resize", update);
  }

  update();
  // Re-run once after layout settles: some engines size the track a frame late,
  // which would otherwise leave the initial active state stale until the first
  // scroll/resize.
  const initRaf = win.requestAnimationFrame(update);

  return () => {
    track.removeEventListener("scroll", onScroll);
    if (ro) ro.disconnect();
    else win.removeEventListener("resize", update);
    if (raf) win.cancelAnimationFrame(raf);
    win.cancelAnimationFrame(initRaf);
    win.clearTimeout(announceTimer);
    teardown.forEach((fn) => fn());
    slides.forEach((s) => (s.inert = false));
    host.removeAttribute("data-re-carousel-ready");
  };
}
