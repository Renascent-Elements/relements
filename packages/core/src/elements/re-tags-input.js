/**
 * <re-tags-input>
 * ---------------
 * Custom-element wrapper around enhanceTagsInput in **container mode** — the
 * element IS the `.re-tags-input` group, so the behavior injects chips around the
 * authored `<input>` WITHOUT moving it. Because a custom element owns its light
 * DOM, the host framework treats `<re-tags-input>` as opaque: this is the
 * framework-safe way to use the token editor in React/Vue/Svelte/Angular (the raw
 * `enhanceTagsInput` on an `<input>` reparents it, which a vdom reconciler can
 * choke on — see the framework guide).
 *
 *   <re-tags-input name="tags" value="design, eng" aria-label="Tags">
 *     <input class="re-input" />
 *   </re-tags-input>
 *
 * Give the element an `aria-label` (or `aria-labelledby`): it has no `<label>`, so
 * that becomes the group's accessible name. The inner `<input>` is the no-JS
 * fallback (a plain comma-separated field) and the form control the behavior
 * adopts; reflected host attributes (`name`, `value`, `placeholder`, `disabled`,
 * `max`, `allow-duplicates`, `tone`, `tags-name`) are applied to it on connect.
 *
 * Exposes:
 *   - `.values` — the committed tag values (read-only `string[]`).
 *   - `.clear()` — removes all tags and fires `re-tags-change` + `change`.
 *   - bubbling `re-tags-change` ({ detail: { values } }) reaches listeners on the
 *     element directly (it IS the group); `change` bubbles too.
 *
 *   import "@relements/core/elements/re-tags-input";
 */

import { enhanceTagsInput } from "../behaviors/tags-input.js";

/** Host attrs reflected onto the inner editor input at connect, before enhance. */
const REFLECTED = ["name", "placeholder"];
/** Host attrs → `data-re-tags-*` options on the input (read once at enhance). */
const DATA_OPTIONS = {
  max: "reTagsMax",
  "tags-name": "reTagsName",
  "allow-duplicates": "reTagsAllowDuplicates",
  tone: "reTagsTone",
};

export class ReTagsInputElement extends HTMLElement {
  /** @type {{ destroy: () => void } | null} */
  #controller = null;
  /** @type {MutationObserver | null} */
  #observer = null;

  static get observedAttributes() {
    return ["disabled"];
  }

  connectedCallback() {
    // The element itself is the container the behavior adopts (container mode).
    this.setAttribute("data-re-tags-input", "");
    if (this.#input) {
      this.#enhance();
    } else {
      // Frameworks may connect the host before projecting the <input> child.
      this.#observer = new MutationObserver(() => {
        if (this.#input) {
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

  attributeChangedCallback() {
    // Only `disabled` is reflected live; the rest are connect-time options the
    // behavior reads once.
    const input = this.#input;
    if (!input) return;
    if (this.hasAttribute("disabled")) input.setAttribute("disabled", "");
    else input.removeAttribute("disabled");
  }

  /** @returns {HTMLInputElement | null} the editor input (not the hidden chip inputs). */
  get #input() {
    return this.querySelector("input:not([type=hidden])");
  }

  #enhance() {
    const input = this.#input;
    if (!input) return;
    // Reflect host attributes onto the editor input BEFORE enhancing — the
    // behavior captures its options (name, max, …) once at enhance time.
    for (const attr of REFLECTED) {
      if (this.hasAttribute(attr)) input.setAttribute(attr, this.getAttribute(attr) ?? "");
    }
    if (this.hasAttribute("value")) input.value = this.getAttribute("value") ?? "";
    if (this.hasAttribute("disabled")) input.setAttribute("disabled", "");
    for (const [attr, ds] of Object.entries(DATA_OPTIONS)) {
      if (this.hasAttribute(attr)) input.dataset[ds] = this.getAttribute(attr) ?? "";
    }
    this.#controller?.destroy();
    this.#controller = enhanceTagsInput(this);
  }

  /** @returns {string[]} the committed tag values, in order. */
  get values() {
    return Array.from(this.querySelectorAll("[data-re-tags-chip] input[type=hidden]")).map(
      (h) => /** @type {HTMLInputElement} */ (h).value,
    );
  }

  /** Remove all tags and notify listeners (mirrors the behavior's change events). */
  clear() {
    const chips = this.querySelectorAll("[data-re-tags-chip]");
    if (!chips.length) return;
    chips.forEach((c) => c.remove());
    this.removeAttribute("data-invalid");
    this.dispatchEvent(
      new CustomEvent("re-tags-change", { bubbles: true, detail: { values: [] } }),
    );
    this.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

if (typeof customElements !== "undefined" && !customElements.get("re-tags-input")) {
  customElements.define("re-tags-input", ReTagsInputElement);
}
