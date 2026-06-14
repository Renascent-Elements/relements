/**
 * enhanceRange
 * ------------
 * Turns a pair of overlaid native range inputs into a two-thumb min–max slider:
 * keeps the thumbs from crossing, draws the fill between them, and routes a
 * track click to the nearer thumb. Base (no JS): two independent, keyboard-
 * operable range inputs that each submit `name=value`.
 *
 *   <fieldset class="re-range" data-re-range>
 *     <legend class="re-field__label">Price</legend>
 *     <div class="re-range__track">
 *       <input type="range" class="re-slider re-range__input" data-re-range-min … />
 *       <input type="range" class="re-slider re-range__input" data-re-range-max … />
 *     </div>
 *     <output class="re-range__output" aria-hidden="true"></output>
 *   </fieldset>
 *   import { enhanceRange } from "@relements/core/behaviors/range";
 *   enhanceRange(document);
 *
 * Both inputs keep their authored min/max (the full range) so their thumbs map
 * to the same coordinate space; crossing is prevented by clamping the moved
 * input's VALUE (not its min/max — that would re-base the thumb position). So
 * each thumb's aria-valuemin/max/now stay honest. Options (data-*):
 * data-re-range-gap (minimum gap between thumbs, in input units; default = step).
 * Dispatches no custom events — native input/change already bubble.
 */

/** @typedef {{ destroy: () => void }} Controller */

/**
 * @param {Document | Element | ShadowRoot} [root=document]
 * @returns {Controller}
 */
export function enhanceRange(root = document) {
  if (root == null) {
    throw new TypeError("enhanceRange: root must be a Document, Element, or ShadowRoot");
  }

  /** @type {Array<() => void>} */
  const cleanups = [];
  if (root instanceof Element && root.matches?.("[data-re-range]")) {
    cleanups.push(wireOne(/** @type {HTMLElement} */ (root)));
  }
  root.querySelectorAll("[data-re-range]").forEach((host) => {
    cleanups.push(wireOne(/** @type {HTMLElement} */ (host)));
  });

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
  if (host.hasAttribute("data-re-range-ready")) return () => {};

  const low = /** @type {HTMLInputElement | null} */ (host.querySelector("[data-re-range-min]"));
  const high = /** @type {HTMLInputElement | null} */ (host.querySelector("[data-re-range-max]"));
  if (!low || !high) return () => {};

  host.setAttribute("data-re-range-ready", "");

  const track = /** @type {HTMLElement | null} */ (host.querySelector(".re-range__track")) ?? host;
  const output = /** @type {HTMLElement | null} */ (host.querySelector(".re-range__output"));
  const rangeMin = Number(low.min || 0);
  const rangeMax = Number(high.max || 100);
  const span = rangeMax - rangeMin || 1;
  const step = Number(low.step) || 1;
  const gap = Number(host.dataset.reRangeGap ?? step) || 0;

  /** Set a value + re-dispatch (setting .value fires nothing natively). */
  const commit = (/** @type {HTMLInputElement} */ input, /** @type {number} */ value) => {
    input.value = String(value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const render = () => {
    const lo = Math.min(low.valueAsNumber, high.valueAsNumber);
    const hi = Math.max(low.valueAsNumber, high.valueAsNumber);
    host.style.setProperty("--re-range-fill-start", `${((lo - rangeMin) / span) * 100}%`);
    host.style.setProperty("--re-range-fill-end", `${((hi - rangeMin) / span) * 100}%`);
    if (output) output.textContent = `${lo} – ${hi}`;
  };

  /** @param {Event} event */
  const onInput = (event) => {
    // Clamp only the input the user moved, so the thumbs can't cross.
    if (event.target === low && low.valueAsNumber > high.valueAsNumber - gap) {
      commit(low, high.valueAsNumber - gap);
      return; // commit() re-fires input → re-enters and renders
    }
    if (event.target === high && high.valueAsNumber < low.valueAsNumber + gap) {
      commit(high, low.valueAsNumber + gap);
      return;
    }
    render();
  };

  /** Track click → move the nearer thumb to the pointer (and focus it). */
  const onPointerdown = (/** @type {PointerEvent} */ event) => {
    // `:disabled` (not `.disabled`) so a disabling <fieldset> is detected — the
    // input's own IDL `disabled` stays false under an inherited fieldset-disable.
    if (low.matches(":disabled") || high.matches(":disabled")) return;
    const rect = track.getBoundingClientRect();
    if (!rect.width) return;
    let frac = (event.clientX - rect.left) / rect.width;
    if (getComputedStyle(host).direction === "rtl") frac = 1 - frac;
    frac = Math.min(1, Math.max(0, frac));
    const raw = rangeMin + frac * span;
    const value = Math.round(raw / step) * step;
    const target =
      Math.abs(value - low.valueAsNumber) <= Math.abs(value - high.valueAsNumber) ? low : high;
    const clamped =
      target === low
        ? Math.min(value, high.valueAsNumber - gap)
        : Math.max(value, low.valueAsNumber + gap);
    target.focus();
    commit(target, clamped);
  };

  low.addEventListener("input", onInput);
  high.addEventListener("input", onInput);
  track.addEventListener("pointerdown", /** @type {EventListener} */ (onPointerdown));
  render();

  return () => {
    low.removeEventListener("input", onInput);
    high.removeEventListener("input", onInput);
    track.removeEventListener("pointerdown", /** @type {EventListener} */ (onPointerdown));
    host.style.removeProperty("--re-range-fill-start");
    host.style.removeProperty("--re-range-fill-end");
    host.removeAttribute("data-re-range-ready");
  };
}
