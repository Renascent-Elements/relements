/**
 * <re-file-picker>
 * ----------------
 * Custom-element wrapper around enhanceFilePicker over light-DOM markup — a
 * thin host like <re-tabs>: the consumer authors the `.re-file-picker__*` parts,
 * the element supplies the container class + behavior marker, reflects
 * disabled/multiple/accept onto the inner input, and runs the behavior on
 * connect (cleanup on disconnect).
 *
 *   <re-file-picker name="docs" multiple accept="image/*">
 *     <label class="re-file-picker__field">
 *       <input type="file" class="re-file-picker__input" />
 *       <span class="re-file-picker__ui">…</span>
 *     </label>
 *     <p class="re-file-picker__list" hidden></p>
 *     <button class="re-file-picker__clear" data-re-file-clear hidden
 *             type="button" aria-label="Clear selection">Clear</button>
 *     <span class="re-file-picker__status re-sr-only" role="status" aria-live="polite"></span>
 *   </re-file-picker>
 *
 * Exposes:
 *   - `.files` — the selected files (read/write `File[]`); writing dispatches change.
 *   - `.clear()` — clears the selection.
 *   - bubbling `re-error` from the behavior (rejected drops) reaches listeners on
 *     the element directly (it IS the host); the native `change` event carries
 *     value changes, as on any file input.
 *
 *   import "@relements/core/elements/re-file-picker";
 */

import { enhanceFilePicker } from "../behaviors/file-picker.js";

const REFLECTED = ["name", "disabled", "multiple", "accept", "required"];

export class ReFilePickerElement extends HTMLElement {
  /** @type {{ destroy: () => void } | null} */
  #controller = null;
  /** @type {MutationObserver | null} */
  #observer = null;

  static get observedAttributes() {
    return REFLECTED;
  }

  connectedCallback() {
    this.classList.add("re-file-picker");
    this.setAttribute("data-re-file-picker", "");
    if (this.#input) {
      this.#enhance();
    } else {
      // Frameworks may connect the host before projecting children.
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
    this.#reflect();
  }

  /** @returns {HTMLInputElement | null} */
  get #input() {
    return this.querySelector(".re-file-picker__input");
  }

  #enhance() {
    this.#reflect();
    this.#controller?.destroy();
    this.#controller = enhanceFilePicker(this);
  }

  /** Mirror host attributes onto the native input (the actual form control). */
  #reflect() {
    const input = this.#input;
    if (!input) return;
    for (const attr of REFLECTED) {
      if (this.hasAttribute(attr)) input.setAttribute(attr, this.getAttribute(attr) ?? "");
      else input.removeAttribute(attr);
    }
  }

  /** @returns {File[]} */
  get files() {
    const input = this.#input;
    return input ? Array.from(input.files ?? []) : [];
  }

  set files(files) {
    const input = this.#input;
    if (!input) return;
    const dt = new DataTransfer();
    Array.from(files ?? []).forEach((f) => dt.items.add(f));
    input.files = dt.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  clear() {
    const input = this.#input;
    if (!input) return;
    input.value = "";
    input.removeAttribute("aria-invalid");
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

if (typeof customElements !== "undefined" && !customElements.get("re-file-picker")) {
  customElements.define("re-file-picker", ReFilePickerElement);
}
