/**
 * enhanceDialog
 * -------------
 * Lightweight ergonomic helpers for native <dialog>.
 *
 * Wires:
 *   - `[data-re-dialog-trigger]` → opens the <dialog> referenced by its
 *     `data-re-dialog-target="dialog-id"` attribute (or aria-controls).
 *   - `[data-re-dialog-close]` inside a <dialog> → closes the parent dialog,
 *     setting the dialog's returnValue to the element's value attribute.
 *   - Click on the dialog's backdrop closes the dialog when the dialog
 *     element itself has `data-re-dialog-close-on-backdrop`.
 *   - `data-re-dialog-no-dismiss` on a <dialog> blocks Escape and backdrop
 *     dismissal (for an alertdialog forcing an explicit choice). Explicit
 *     `[data-re-dialog-close]` buttons still close it — and one MUST exist.
 *
 * Usage:
 *
 *   <button type="button" data-re-dialog-trigger data-re-dialog-target="confirm">
 *     Open
 *   </button>
 *   <dialog id="confirm" data-re-dialog-close-on-backdrop>
 *     …
 *     <button data-re-dialog-close value="cancel">Cancel</button>
 *   </dialog>
 *
 *   import { enhanceDialog } from "@relements/core/behaviors/dialog";
 *   const c = enhanceDialog(document);
 *   c.destroy();
 *
 * Native semantics are preserved: showModal/close/Escape behavior all
 * come from the browser.
 */

/**
 * @param {Document | Element | ShadowRoot} [root=document]
 * @returns {{ destroy: () => void }}
 */
export function enhanceDialog(root = document) {
  if (root == null) {
    throw new TypeError("enhanceDialog: root must be a Document, Element, or ShadowRoot");
  }

  /** @param {Event} event */
  const onClick = (event) => {
    const target = /** @type {Element | null} */ (event.target);
    if (!target) return;

    // 1) Trigger → open dialog
    const trigger = target.closest("[data-re-dialog-trigger]");
    if (trigger) {
      const id =
        trigger.getAttribute("data-re-dialog-target") ?? trigger.getAttribute("aria-controls");
      if (!id) return;
      const ownerDoc = trigger.ownerDocument;
      const dialog = /** @type {HTMLDialogElement | null} */ (ownerDoc.getElementById(id));
      if (dialog && typeof dialog.showModal === "function" && !dialog.open) {
        dialog.showModal();
      }
      return;
    }

    // 2) Close button inside a dialog
    const closeBtn = target.closest("[data-re-dialog-close]");
    if (closeBtn) {
      const dialog = /** @type {HTMLDialogElement | null} */ (closeBtn.closest("dialog"));
      if (dialog && dialog.open) {
        const value = /** @type {HTMLButtonElement} */ (closeBtn).value || "";
        dialog.close(value);
      }
      return;
    }

    // 3) Backdrop click → close (only when opted in, and never when the
    //    dialog opts out of dismissal — see data-re-dialog-no-dismiss).
    if (target.tagName === "DIALOG") {
      const dialog = /** @type {HTMLDialogElement} */ (target);
      if (
        dialog.open &&
        dialog.hasAttribute("data-re-dialog-close-on-backdrop") &&
        !dialog.hasAttribute("data-re-dialog-no-dismiss") &&
        isEventOnBackdrop(/** @type {MouseEvent} */ (event), dialog)
      ) {
        dialog.close("backdrop");
      }
    }
  };

  // Block Escape / platform dismissal for a dialog marked
  // `data-re-dialog-no-dismiss` (e.g. an alertdialog forcing an explicit
  // choice). The `cancel` event fires only for close *requests* — explicit
  // [data-re-dialog-close] buttons and form[method=dialog] submits still
  // close. `cancel` does NOT bubble, so listen in the capture phase.
  /** @param {Event} event */
  const onCancel = (event) => {
    const dialog = /** @type {EventTarget | null} */ (event.target);
    if (dialog instanceof HTMLDialogElement && dialog.hasAttribute("data-re-dialog-no-dismiss")) {
      event.preventDefault();
      // A no-dismiss dialog with no in-dialog close control is a keyboard trap.
      if (!dialog.querySelector("[data-re-dialog-close]") && !dialog.dataset.reDialogWarned) {
        dialog.dataset.reDialogWarned = "true";
        console.warn(
          "enhanceDialog: a [data-re-dialog-no-dismiss] dialog has no [data-re-dialog-close] control — users cannot dismiss it.",
          dialog,
        );
      }
    }
  };

  root.addEventListener("click", onClick);
  root.addEventListener("cancel", onCancel, true);

  return {
    destroy() {
      root.removeEventListener("click", onClick);
      root.removeEventListener("cancel", onCancel, true);
    },
  };
}

/**
 * The native ::backdrop pseudo-element is the click target when the user
 * clicks outside the dialog box. Detect by comparing the click coordinates
 * against the dialog's bounding box.
 *
 * @param {MouseEvent} event
 * @param {HTMLDialogElement} dialog
 * @returns {boolean}
 */
function isEventOnBackdrop(event, dialog) {
  const rect = dialog.getBoundingClientRect();
  const { clientX: x, clientY: y } = event;
  return x < rect.left || x > rect.right || y < rect.top || y > rect.bottom;
}
