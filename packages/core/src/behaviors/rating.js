/**
 * enhanceRating
 * -------------
 * Optional: makes a `.re-rating`'s arrow keys behave consistently across
 * browsers. The CSS-only base is fully usable (click + native radio arrows),
 * but native arrow-key direction in a reversed radio group is browser-dependent
 * (Chromium honors `direction: rtl`, WebKit does not), so this normalizes it:
 * ArrowRight/ArrowUp always select the next-higher star, ArrowLeft/ArrowDown the
 * next-lower — by value, identically everywhere.
 *
 *   <fieldset class="re-rating">…radios…</fieldset>
 *   import { enhanceRating } from "@relements/core/behaviors/rating";
 *   enhanceRating(document);
 *
 * Without JS the rating still works (selection operable; only the arrow
 * direction may mirror in some browsers).
 */

/** @typedef {{ destroy: () => void }} Controller */

const STEP = { ArrowRight: 1, ArrowUp: 1, ArrowDown: -1, ArrowLeft: -1 };

/**
 * @param {Document | Element | ShadowRoot} [root=document]
 * @returns {Controller}
 */
export function enhanceRating(root = document) {
  if (root == null) {
    throw new TypeError("enhanceRating: root must be a Document, Element, or ShadowRoot");
  }

  /** @type {Array<() => void>} */
  const cleanups = [];

  if (root instanceof Element && root.matches?.(".re-rating")) {
    cleanups.push(wireOne(/** @type {HTMLElement} */ (root)));
  }
  root.querySelectorAll(".re-rating").forEach((fs) => {
    cleanups.push(wireOne(/** @type {HTMLElement} */ (fs)));
  });

  return {
    destroy() {
      while (cleanups.length) cleanups.pop()?.();
    },
  };
}

/**
 * @param {HTMLElement} fieldset
 * @returns {() => void}
 */
function wireOne(fieldset) {
  if (fieldset.hasAttribute("data-re-rating-ready")) return () => {};
  fieldset.setAttribute("data-re-rating-ready", "");

  /** @param {KeyboardEvent} event */
  const onKeydown = (event) => {
    const dir = STEP[/** @type {keyof typeof STEP} */ (event.key)];
    if (!dir) return;
    // Star radios in ascending value order (exclude the hidden "clear"/0 option
    // and any disabled radio from arrow navigation).
    const radios = /** @type {HTMLInputElement[]} */ (
      Array.from(fieldset.querySelectorAll("input[type=radio]"))
    )
      .filter((r) => !r.disabled && Number(r.value) > 0)
      .sort((a, b) => Number(a.value) - Number(b.value));
    if (!radios.length) return;

    const current = /** @type {HTMLInputElement} */ (event.target);
    const idx = radios.indexOf(current);
    const from = idx === -1 ? (dir > 0 ? -1 : radios.length) : idx;
    const next = radios[Math.max(0, Math.min(from + dir, radios.length - 1))];
    if (!next || next === current) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    next.checked = true;
    next.focus();
    next.dispatchEvent(new Event("input", { bubbles: true }));
    next.dispatchEvent(new Event("change", { bubbles: true }));
  };

  fieldset.addEventListener("keydown", /** @type {EventListener} */ (onKeydown));

  return () => {
    fieldset.removeEventListener("keydown", /** @type {EventListener} */ (onKeydown));
    fieldset.removeAttribute("data-re-rating-ready");
  };
}
