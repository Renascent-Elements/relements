/**
 * <re-menu>
 * ---------
 * Custom element wrapping the menu-button pattern over light-DOM markup.
 *
 *   <re-menu>
 *     <button class="re-button" aria-haspopup="menu" aria-expanded="false" aria-controls="m" id="b">Actions</button>
 *     <div class="re-menu__panel" role="menu" id="m" aria-labelledby="b" hidden>
 *       <button class="re-menu__item" role="menuitem" data-value="a">A</button>
 *     </div>
 *   </re-menu>
 *
 * The element exposes:
 *   - `.open` boolean reflecting/setting the open state.
 *   - bubbles `re-select` from the underlying enhancer.
 */

import { enhanceMenuButton } from "../behaviors/menu-button.js";

export class ReMenuElement extends HTMLElement {
  /** @type {{ destroy: () => void } | null} */
  #controller = null;

  connectedCallback() {
    this.classList.add("re-menu");
    this.setAttribute("data-re-menu", "");
    this.#controller = enhanceMenuButton(this);
  }

  disconnectedCallback() {
    this.#controller?.destroy();
    this.#controller = null;
  }

  /** @returns {boolean} */
  get open() {
    const btn = this.querySelector('[aria-haspopup="menu"], [aria-haspopup="true"]');
    return btn?.getAttribute("aria-expanded") === "true";
  }

  set open(value) {
    const btn = /** @type {HTMLElement | null} */ (
      this.querySelector('[aria-haspopup="menu"], [aria-haspopup="true"]')
    );
    if (!btn) return;
    const want = Boolean(value);
    if (this.open === want) return;
    btn.click();
  }
}

if (typeof customElements !== "undefined" && !customElements.get("re-menu")) {
  customElements.define("re-menu", ReMenuElement);
}
