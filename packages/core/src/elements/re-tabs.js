/**
 * <re-tabs>
 * ---------
 * Custom-element wrapper around enhanceTabs over light-DOM markup.
 *
 *   <re-tabs aria-label="Account">
 *     <div role="tablist">
 *       <button role="tab" id="t-1" aria-controls="p-1" aria-selected="true">Profile</button>
 *       <button role="tab" id="t-2" aria-controls="p-2" aria-selected="false" tabindex="-1">Security</button>
 *     </div>
 *     <section role="tabpanel" id="p-1" aria-labelledby="t-1">…</section>
 *     <section role="tabpanel" id="p-2" aria-labelledby="t-2" hidden>…</section>
 *   </re-tabs>
 *
 * Exposes:
 *   - Property `value`: id of the selected tab (e.g. "t-1"). Set to switch.
 *   - Re-dispatches `re-change` from the underlying enhancer with bubbles.
 *   - Works framework-neutrally: any HTML rendering produces the same contract.
 *
 *   import "@relements/core/elements/re-tabs";
 */

import { enhanceTabs } from "../behaviors/tabs.js";

export class ReTabsElement extends HTMLElement {
  /** @type {{ destroy: () => void } | null} */
  #controller = null;
  /** @type {MutationObserver | null} */
  #observer = null;

  static get observedAttributes() {
    return ["value"];
  }

  connectedCallback() {
    // Mark the host so enhanceTabs picks it up.
    this.setAttribute("data-re-tabs", "");
    if (this.#hasTabs()) {
      this.#enhance();
    } else {
      // Some frameworks (e.g. Angular) connect the host before projecting its
      // children. Enhance once the tabs appear, then stop observing.
      this.#observer = new MutationObserver(() => {
        if (this.#hasTabs()) {
          this.#observer?.disconnect();
          this.#observer = null;
          this.#enhance();
        }
      });
      this.#observer.observe(this, { childList: true, subtree: true });
    }
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#observer = null;
    this.#controller?.destroy();
    this.#controller = null;
  }

  /** @returns {boolean} */
  #hasTabs() {
    return !!this.querySelector('[role="tablist"] [role="tab"]');
  }

  #enhance() {
    // Idempotent: tear down any prior controller first so a reconnected or
    // moved host (with children already present) does not double-wire listeners.
    this.#controller?.destroy();
    this.#controller = enhanceTabs(this);
    // Honor a value attribute if present and different from initial state.
    const initial = this.getAttribute("value");
    if (initial) this.#selectById(initial);
  }

  /**
   * @param {string} name
   * @param {string | null} _oldValue
   * @param {string | null} newValue
   */
  attributeChangedCallback(name, _oldValue, newValue) {
    if (name === "value" && newValue) {
      this.#selectById(newValue);
    }
  }

  /**
   * Currently selected tab id.
   * @returns {string | null}
   */
  get value() {
    const sel = this.querySelector('[role="tab"][aria-selected="true"]');
    return sel ? sel.id : null;
  }

  set value(id) {
    if (!id) return;
    this.setAttribute("value", id);
    this.#selectById(id);
  }

  /**
   * @param {string} id
   */
  #selectById(id) {
    /** @type {HTMLElement | null} */
    const tab = this.querySelector(`[role="tab"]#${cssEscape(id)}`);
    if (tab && tab.getAttribute("aria-selected") !== "true") {
      tab.click();
    }
  }
}

/** @param {string} value */
function cssEscape(value) {
  return typeof CSS !== "undefined" && CSS.escape ? CSS.escape(value) : value;
}

if (typeof customElements !== "undefined" && !customElements.get("re-tabs")) {
  customElements.define("re-tabs", ReTabsElement);
}
