/**
 * enhanceDismissible
 * ------------------
 * Wires up dismiss buttons inside any element marked `[data-re-dismissible]`.
 *
 * Usage in HTML:
 *
 *   <aside data-re-dismissible>
 *     Banner copy…
 *     <button type="button" data-re-dismiss aria-label="Dismiss">×</button>
 *   </aside>
 *
 * Usage in JavaScript:
 *
 *   import { enhanceDismissible } from "@relements/core/behaviors/dismissible";
 *   const controller = enhanceDismissible(document);
 *   // …later
 *   controller.destroy();
 *
 * Behavior:
 *   - Click or Enter/Space on `[data-re-dismiss]` hides the closest
 *     `[data-re-dismissible]` ancestor (sets `hidden`).
 *   - Dispatches a `re-dismiss` `CustomEvent` (bubbles, cancelable) on the
 *     dismissible element before hiding; calling `preventDefault()` cancels.
 *   - `controller.destroy()` removes all listeners.
 *
 * Root can be a Document, Element, or ShadowRoot.
 */

/**
 * @param {Document | Element | ShadowRoot} [root=document]
 * @returns {{ destroy: () => void }}
 */
export function enhanceDismissible(root = document) {
  if (root == null) {
    throw new TypeError("enhanceDismissible: root must be a Document, Element, or ShadowRoot");
  }

  /** @type {(event: Event) => void} */
  const handle = (event) => {
    const target = /** @type {Element | null} */ (event.target);
    if (!target) return;
    const trigger = target.closest("[data-re-dismiss]");
    if (!trigger) return;
    if (event.type === "keydown") {
      const ke = /** @type {KeyboardEvent} */ (event);
      if (ke.key !== "Enter" && ke.key !== " " && ke.key !== "Spacebar") return;
      ke.preventDefault();
    }
    const host = trigger.closest("[data-re-dismissible]");
    if (!host) return;
    const cancelable = host.dispatchEvent(
      new CustomEvent("re-dismiss", { bubbles: true, cancelable: true }),
    );
    if (!cancelable) return;
    /** @type {HTMLElement} */ (host).hidden = true;
  };

  root.addEventListener("click", handle);
  root.addEventListener("keydown", handle);

  return {
    destroy() {
      root.removeEventListener("click", handle);
      root.removeEventListener("keydown", handle);
    },
  };
}
