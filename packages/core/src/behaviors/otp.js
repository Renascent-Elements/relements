/**
 * enhanceOtp
 * ----------
 * OPTIONAL, autofill-safe polish for a `.re-otp` one-time-code input. It never
 * splits the field, never rewrites the value (except the opt-in digit strip),
 * and never auto-advances or auto-submits — so native paste, SMS autofill, IME,
 * and selection keep working. The field is fully usable with no JS.
 *
 *   <input class="re-otp" data-re-otp inputmode="numeric" maxlength="6" />
 *   import { enhanceOtp } from "@relements/core/behaviors/otp";
 *   const c = enhanceOtp(document);
 *
 * What it adds:
 *   - An active-cell highlight: tracks the caret and sets --re-otp-active-index
 *     on the enclosing .re-otp-field (a CSS hook; no visual shipped by default).
 *   - With `data-re-otp-numeric`: strips non-digits on input (re-dispatching a
 *     bubbling `input`), for engines/keyboards that ignore inputmode.
 */

/** @typedef {{ destroy: () => void }} Controller */

/**
 * @param {Document | Element | ShadowRoot} [root=document]
 * @returns {Controller}
 */
export function enhanceOtp(root = document) {
  if (root == null) {
    throw new TypeError("enhanceOtp: root must be a Document, Element, or ShadowRoot");
  }

  /** @type {Array<() => void>} */
  const cleanups = [];

  if (root instanceof Element && root.matches?.("input[data-re-otp]")) {
    cleanups.push(wireOne(/** @type {HTMLInputElement} */ (root)));
  }
  root.querySelectorAll("input[data-re-otp]").forEach((input) => {
    cleanups.push(wireOne(/** @type {HTMLInputElement} */ (input)));
  });

  return {
    destroy() {
      while (cleanups.length) cleanups.pop()?.();
    },
  };
}

/**
 * @param {HTMLInputElement} input
 * @returns {() => void}
 */
function wireOne(input) {
  if (input.hasAttribute("data-re-otp-ready")) return () => {};
  input.setAttribute("data-re-otp-ready", "");

  const field = input.closest(".re-otp-field");
  const max = parseInt(input.getAttribute("maxlength") || "", 10);
  const length = Number.isFinite(max) && max > 0 ? max : 6;
  const numeric = input.hasAttribute("data-re-otp-numeric");

  const syncActive = () => {
    if (!field) return;
    const pos = input.selectionStart ?? input.value.length;
    // Clamp so the caret after the last char still highlights the last cell.
    const idx = Math.max(0, Math.min(pos, length - 1));
    /** @type {HTMLElement} */ (field).style.setProperty("--re-otp-active-index", String(idx));
  };

  const onInput = () => {
    if (numeric) {
      const cleaned = input.value.replace(/\D/g, "");
      if (cleaned !== input.value) {
        const at = input.selectionStart;
        input.value = cleaned;
        if (at !== null) {
          try {
            input.setSelectionRange(at - 1, at - 1);
          } catch {
            /* ignore */
          }
        }
        input.dispatchEvent(new InputEvent("input", { bubbles: true }));
      }
    }
    syncActive();
  };

  input.addEventListener("input", onInput);
  input.addEventListener("keyup", syncActive);
  input.addEventListener("click", syncActive);
  input.addEventListener("focus", syncActive);
  document.addEventListener("selectionchange", syncActive);
  syncActive();

  return () => {
    input.removeEventListener("input", onInput);
    input.removeEventListener("keyup", syncActive);
    input.removeEventListener("click", syncActive);
    input.removeEventListener("focus", syncActive);
    document.removeEventListener("selectionchange", syncActive);
    input.removeAttribute("data-re-otp-ready");
    if (field) /** @type {HTMLElement} */ (field).style.removeProperty("--re-otp-active-index");
  };
}
