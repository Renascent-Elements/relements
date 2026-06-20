/**
 * enhanceCarousel
 * ---------------
 * The thin JS control layer (Rung C) over a `.re-carousel` whose `__track` is a
 * native CSS scroll-snap strip (Rung A). The track already scrolls and snaps
 * with zero JS — by touch, trackpad, scrollbar, and (as a focusable scroll
 * region) Arrow/Page/Home/End. This behavior only back-fills the *discoverable*
 * controls and the bookkeeping the platform doesn't give us:
 *
 *   - prev / next buttons and a dot strip (plain `<button>`s with `aria-label`
 *     + `aria-current` — NOT a tablist),
 *   - active-slide tracking by **rect centre-distance** (not scrollLeft sign,
 *     not IntersectionObserver ratio) so it's correct under RTL and with peeking,
 *   - disabling prev/next at the ends (no wrap),
 *   - inerting off-screen slides so Tab can't land on a scrolled-away slide,
 *   - an optional polite live announcement of the settled slide.
 *
 * Navigation uses `scrollIntoView({ inline: "center" })` — a logical axis, so RTL
 * is free — and honors `prefers-reduced-motion`. There is NO custom event: the
 * native `scroll` carries position; derive the index yourself if you need it.
 *
 * Dynamic slides are out of scope: re-run `enhanceCarousel` after adding/removing
 * slides. (3b will add the CSS-Carousel-pseudo rung behind `@supports` and gate
 * this behavior off where the browser draws those controls itself.)
 *
 *   <div class="re-carousel" data-re-carousel>
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

/** Build the (left-pointing) chevron icon via DOM — no innerHTML. */
function chevron(doc) {
  const svg = doc.createElementNS(SVG_NS, "svg");
  for (const [k, v] of Object.entries({
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  })) {
    svg.setAttribute(k, v);
  }
  const poly = doc.createElementNS(SVG_NS, "polyline");
  poly.setAttribute("points", "15 18 9 12 15 6");
  svg.appendChild(poly);
  return svg;
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
  if (slides.length < 2) return () => {}; // nothing to navigate
  host.setAttribute("data-re-carousel-ready", "");

  const doc = host.ownerDocument;
  const win = doc.defaultView ?? window;

  // One slide per view? Inerting + position announcements only make sense then;
  // a peeking/multi-visible carousel skips both (a v2 concern).
  const singlePerView = () => slides[0].offsetWidth >= track.clientWidth * 0.9;
  const reduce = () => win.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- inject controls --------------------------------------------------
  const control = (dir, label) => {
    const b = doc.createElement("button");
    b.type = "button";
    b.className = "re-carousel__control";
    b.dataset.dir = dir;
    b.setAttribute("aria-label", label);
    b.appendChild(chevron(doc));
    return b;
  };
  const prev = control("prev", "Previous slide");
  const next = control("next", "Next slide");

  const dotsWrap = doc.createElement("div");
  dotsWrap.className = "re-carousel__dots";
  const dots = slides.map((_, i) => {
    const d = doc.createElement("button");
    d.type = "button";
    d.className = "re-carousel__dot";
    d.setAttribute("aria-label", `Go to slide ${i + 1}`);
    d.addEventListener("click", () => nav(i));
    dotsWrap.appendChild(d);
    return d;
  });

  const live = doc.createElement("div");
  live.className = "re-sr-only";
  live.setAttribute("aria-live", "polite");

  host.append(prev, next, dotsWrap, live);

  // --- state ------------------------------------------------------------
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
    slides[target].scrollIntoView({
      behavior: reduce() ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  const update = () => {
    const active = activeIndex();
    prev.disabled = active <= 0;
    next.disabled = active >= slides.length - 1;
    dots.forEach((d, i) => d.setAttribute("aria-current", String(i === active)));
    if (singlePerView()) slides.forEach((s, i) => (s.inert = i !== active));
  };

  const announce = () => {
    if (!singlePerView()) return;
    const i = activeIndex();
    const name = slides[i].getAttribute("aria-label");
    live.textContent = name
      ? `${name} (${i + 1} of ${slides.length})`
      : `Slide ${i + 1} of ${slides.length}`;
  };

  // --- listeners --------------------------------------------------------
  const onPrev = () => nav(activeIndex() - 1);
  const onNext = () => nav(activeIndex() + 1);
  prev.addEventListener("click", onPrev);
  next.addEventListener("click", onNext);

  let raf = 0;
  let announceTimer = 0;
  const onScroll = () => {
    if (!raf) raf = win.requestAnimationFrame(() => ((raf = 0), update()));
    win.clearTimeout(announceTimer);
    announceTimer = win.setTimeout(announce, 150); // settle, then announce
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

  return () => {
    prev.removeEventListener("click", onPrev);
    next.removeEventListener("click", onNext);
    track.removeEventListener("scroll", onScroll);
    if (ro) ro.disconnect();
    else win.removeEventListener("resize", update);
    if (raf) win.cancelAnimationFrame(raf);
    win.clearTimeout(announceTimer);
    slides.forEach((s) => (s.inert = false));
    // Injected elements (and their listeners) are removed wholesale.
    prev.remove();
    next.remove();
    dotsWrap.remove();
    live.remove();
    host.removeAttribute("data-re-carousel-ready");
  };
}
