/**
 * <re-toast>
 * ----------
 * Custom element that hosts a toast region in light DOM and exposes a
 * `.show(message, options)` method matching the showToast() API.
 *
 *   <re-toast id="toaster"></re-toast>
 *   <script type="module">
 *     import "@relements/core/elements/re-toast";
 *     document.getElementById("toaster").show("Hi", { tone: "success" });
 *   </script>
 *
 * On connection the element materializes a `.re-toast-region` / `.re-toast-list`
 * inside itself if not already present. Toasts use the same CSS as the
 * functional API.
 */

import { showToast } from "../behaviors/toast.js";

export class ReToastElement extends HTMLElement {
  connectedCallback() {
    if (!this.querySelector("[data-re-toast-region]")) {
      this.classList.add("re-toast-region");
      this.setAttribute("role", "region");
      if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", "Notifications");
      this.setAttribute("data-re-toast-region", "");
      const list = document.createElement("div");
      list.className = "re-toast-list";
      list.setAttribute("aria-live", this.getAttribute("data-live") ?? "polite");
      list.setAttribute("aria-relevant", "additions");
      this.appendChild(list);
    }
  }

  /**
   * @param {string} message
   * @param {Parameters<typeof showToast>[1]} [options]
   */
  show(message, options) {
    return showToast(message, { ...options, root: this });
  }
}

if (typeof customElements !== "undefined" && !customElements.get("re-toast")) {
  customElements.define("re-toast", ReToastElement);
}
