/**
 * enhanceAutosize
 * ---------------
 * Makes a `.re-textarea[data-autosize]` grow with its content.
 *
 * Modern browsers do this in pure CSS via `field-sizing: content` (see
 * form.css). This behavior is the FALLBACK for engines without it (Firefox at
 * the floor): it measures scrollHeight on input and sets the height. It is a
 * NO-OP where `field-sizing` is supported, so calling it always is safe.
 *
 *   <textarea class="re-textarea" data-autosize rows="2"></textarea>
 *   import { enhanceAutosize } from "@relements/core/behaviors/autosize";
 *   const c = enhanceAutosize(document);
 *
 * Without JS (and without field-sizing) the textarea stays a normal resizable
 * textarea — nothing breaks.
 */

/** @typedef {{ destroy: () => void }} Controller */

const SUPPORTS_FIELD_SIZING =
  typeof CSS !== "undefined" && CSS.supports && CSS.supports("field-sizing", "content");

/**
 * @param {Document | Element | ShadowRoot} [root=document]
 * @returns {Controller}
 */
export function enhanceAutosize(root = document) {
  if (root == null) {
    throw new TypeError("enhanceAutosize: root must be a Document, Element, or ShadowRoot");
  }
  // Native CSS handles it — nothing to wire.
  if (SUPPORTS_FIELD_SIZING) return { destroy() {} };

  /** @type {Array<() => void>} */
  const cleanups = [];

  if (root instanceof Element && root.matches?.(".re-textarea[data-autosize]")) {
    cleanups.push(wireOne(/** @type {HTMLTextAreaElement} */ (root)));
  }
  root.querySelectorAll(".re-textarea[data-autosize]").forEach((ta) => {
    cleanups.push(wireOne(/** @type {HTMLTextAreaElement} */ (ta)));
  });

  return {
    destroy() {
      while (cleanups.length) cleanups.pop()?.();
    },
  };
}

/**
 * @param {HTMLTextAreaElement} ta
 * @returns {() => void}
 */
function wireOne(ta) {
  if (ta.hasAttribute("data-re-autosize-ready")) return () => {};
  ta.setAttribute("data-re-autosize-ready", "");

  const prevResize = ta.style.resize;
  const prevOverflowY = ta.style.overflowY;
  const prevMaxBlock = ta.style.maxBlockSize;
  ta.style.resize = "none";
  // The CSS cap lives inside @supports (field-sizing) — absent on this path —
  // so apply it inline here, resolving the same custom property. This both
  // clamps the rendered height and makes the px value readable below.
  ta.style.maxBlockSize = "var(--re-autosize-max-block-size, 18rem)";

  let raf = 0;

  const resize = () => {
    raf = 0;
    // Collapse first so scrollHeight reports the content's natural height.
    ta.style.height = "auto";
    const cs = getComputedStyle(ta);
    // scrollHeight covers content + padding but NOT border; the height
    // property under border-box includes the border, so add it back.
    const border = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
    const min = parseFloat(cs.minBlockSize) || 0;
    const max = parseFloat(cs.maxBlockSize);
    const next = Math.max(ta.scrollHeight + border, min);
    ta.style.height = `${next}px`;
    ta.style.overflowY = Number.isFinite(max) && next > max ? "auto" : "hidden";
  };

  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(resize);
  };

  ta.addEventListener("input", schedule);
  // Width changes (responsive reflow) change wrapping → re-measure.
  const ro = new ResizeObserver(schedule);
  ro.observe(ta);
  schedule(); // initial sync (coalesced, no synchronous reflow during enhance)

  return () => {
    ta.removeEventListener("input", schedule);
    ro.disconnect();
    if (raf) cancelAnimationFrame(raf);
    ta.style.height = "";
    ta.style.resize = prevResize;
    ta.style.overflowY = prevOverflowY;
    ta.style.maxBlockSize = prevMaxBlock;
    ta.removeAttribute("data-re-autosize-ready");
  };
}
