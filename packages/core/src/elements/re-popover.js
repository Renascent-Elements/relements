/**
 * <re-popover>
 * ------------
 * Custom element wrapping the native popover attribute.
 *
 *   <button class="re-button" popovertarget="tip">Toggle</button>
 *   <re-popover id="tip">
 *     <p>Hello!</p>
 *   </re-popover>
 *
 * The element receives the native `popover` attribute on connect and
 * runs enhancePopover for anchored positioning + re-toggle event.
 *
 * Methods:
 *   show()    — calls showPopover()
 *   hide()    — calls hidePopover()
 *   toggle()  — calls togglePopover()
 *
 * Property:
 *   open      — boolean reflecting native :popover-open state
 */

import { enhancePopover } from "../behaviors/popover.js";

export class RePopoverElement extends HTMLElement {
  /** @type {{ destroy: () => void } | null} */
  #controller = null;

  connectedCallback() {
    if (!this.hasAttribute("popover")) this.setAttribute("popover", "auto");
    this.classList.add("re-popover");
    this.setAttribute("data-re-popover", "");
    this.#controller = enhancePopover(this);
  }

  disconnectedCallback() {
    this.#controller?.destroy();
    this.#controller = null;
  }

  /** @returns {boolean} */
  get open() {
    return this.matches?.(":popover-open") ?? false;
  }

  show() {
    /** @type {any} */ (this).showPopover?.();
  }
  hide() {
    /** @type {any} */ (this).hidePopover?.();
  }
  toggle() {
    /** @type {any} */ (this).togglePopover?.();
  }
}

if (typeof customElements !== "undefined" && !customElements.get("re-popover")) {
  customElements.define("re-popover", RePopoverElement);
}
