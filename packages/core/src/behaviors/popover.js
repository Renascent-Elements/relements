/**
 * enhancePopover
 * --------------
 * Thin helper for native [popover]. Provides:
 *   - Anchored positioning: places the popover below its `popovertarget`
 *     button when the popover opens. (Native CSS Anchor Positioning isn't
 *     universally supported yet; this is a tiny JS fallback.)
 *   - `re-toggle` CustomEvent on the popover element when it opens/closes
 *     (detail = { open: boolean }), mirroring the native `toggle` event so
 *     consumers don't need feature-detect it.
 *
 *   <button class="re-button" popovertarget="tip">Toggle</button>
 *   <div class="re-popover" id="tip" popover data-re-popover>Hello</div>
 *
 *   import { enhancePopover } from "@relements/core/behaviors/popover";
 *   const c = enhancePopover(document);
 */

/** @typedef {{ destroy: () => void }} Controller */

/**
 * @param {Document | Element | ShadowRoot} [root=document]
 * @returns {Controller}
 */
export function enhancePopover(root = document) {
  if (root == null) {
    throw new TypeError("enhancePopover: root must be a Document, Element, or ShadowRoot");
  }

  /** @type {Array<() => void>} */
  const cleanups = [];

  if (root instanceof Element && /** @type {Element} */ (root).matches?.("[data-re-popover]")) {
    cleanups.push(wireOne(/** @type {HTMLElement} */ (root)));
  }

  /** @type {NodeListOf<HTMLElement>} */
  const popovers = root.querySelectorAll("[data-re-popover]");
  popovers.forEach((pop) => {
    cleanups.push(wireOne(pop));
  });

  return {
    destroy() {
      while (cleanups.length) cleanups.pop()?.();
    },
  };
}

/**
 * @param {HTMLElement} popover
 * @returns {() => void}
 */
function wireOne(popover) {
  if (!("popover" in popover) || typeof popover.showPopover !== "function") {
    // Native popover API unavailable. Bail out gracefully.
    return () => {};
  }

  /** @param {Event} event */
  const onToggle = (event) => {
    const e = /** @type {ToggleEvent} */ (event);
    const open = e.newState === "open";
    if (open) {
      positionUnderTrigger(popover);
    }
    popover.dispatchEvent(
      new CustomEvent("re-toggle", {
        bubbles: true,
        detail: { open },
      }),
    );
  };

  popover.addEventListener("toggle", onToggle);

  return () => {
    popover.removeEventListener("toggle", onToggle);
  };
}

/**
 * @param {HTMLElement} popover
 */
function positionUnderTrigger(popover) {
  const id = popover.id;
  if (!id) return;
  /** @type {HTMLElement | null} */
  const trigger = document.querySelector(`[popovertarget="${cssEscape(id)}"]`);
  if (!trigger) return;
  const tRect = trigger.getBoundingClientRect();
  popover.style.position = "fixed";
  popover.style.insetInlineStart = `${tRect.left}px`;
  popover.style.insetBlockStart = `${tRect.bottom + 4}px`;
  popover.style.insetInlineEnd = "auto";
  popover.style.insetBlockEnd = "auto";
  popover.style.margin = "0";
}

/** @param {string} value */
function cssEscape(value) {
  return typeof CSS !== "undefined" && CSS.escape ? CSS.escape(value) : value;
}
