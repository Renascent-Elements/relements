/**
 * Toast helpers.
 *
 *   <div class="re-toast-region" data-re-toast-region role="region" aria-label="Notifications">
 *     <ul class="re-toast-list" aria-live="polite" aria-relevant="additions"></ul>
 *   </div>
 *
 *   import { showToast } from "@relements/core/behaviors/toast";
 *   showToast("Saved", { tone: "success" });
 *   showToast("Network error", { tone: "danger", duration: 8000 });
 *
 * If no `[data-re-toast-region]` exists, one is created and appended to
 * `document.body` on first call.
 */

/**
 * @typedef {object} ToastOptions
 * @property {"default"|"success"|"warning"|"danger"} [tone="default"]
 * @property {number} [duration=4000]  Auto-dismiss in ms. Pass 0 to disable.
 * @property {Document|Element} [root]  Override the host to search for a region in.
 */

/**
 * @param {string} message
 * @param {ToastOptions} [options]
 * @returns {{ dismiss: () => void; element: HTMLDivElement }}
 */
export function showToast(message, options = {}) {
  const { tone = "default", duration = 4000, root = document } = options;

  const list = ensureRegion(root).querySelector(".re-toast-list");
  if (!list) {
    throw new Error("showToast: toast region missing a `.re-toast-list`");
  }

  const item = document.createElement("div");
  item.className = "re-toast";
  if (tone !== "default") item.dataset.tone = tone;
  item.setAttribute("role", tone === "danger" ? "alert" : "status");

  const body = document.createElement("div");
  body.className = "re-toast__body";
  body.textContent = message;
  item.appendChild(body);

  const dismissBtn = document.createElement("button");
  dismissBtn.type = "button";
  dismissBtn.className = "re-toast__dismiss";
  dismissBtn.setAttribute("aria-label", "Dismiss notification");
  dismissBtn.textContent = "×";
  item.appendChild(dismissBtn);

  list.appendChild(item);

  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let timer;
  const dismiss = () => {
    if (timer != null) {
      clearTimeout(timer);
      timer = undefined;
    }
    item.dispatchEvent(new CustomEvent("re-toast-dismiss", { bubbles: true }));
    item.remove();
  };

  dismissBtn.addEventListener("click", dismiss);

  if (duration > 0) {
    timer = setTimeout(dismiss, duration);
  }

  return { dismiss, element: item };
}

/**
 * @param {Document|Element} root
 * @returns {HTMLElement}
 */
function ensureRegion(root) {
  const scope =
    root instanceof Document ? root : /** @type {Element} */ (root.ownerDocument ?? document);
  /** @type {HTMLElement | null} */
  let region = /** @type {HTMLElement | null} */ (scope.querySelector("[data-re-toast-region]"));
  if (region) return region;
  region = scope.createElement("div");
  region.className = "re-toast-region";
  region.setAttribute("role", "region");
  region.setAttribute("aria-label", "Notifications");
  region.dataset.reToastRegion = "";
  const list = scope.createElement("div");
  list.className = "re-toast-list";
  list.setAttribute("aria-live", "polite");
  list.setAttribute("aria-relevant", "additions");
  region.appendChild(list);
  scope.body.appendChild(region);
  return region;
}
