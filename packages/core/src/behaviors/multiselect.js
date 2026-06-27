/**
 * enhanceMultiSelect
 * ------------------
 * The optional JS layer over a `.re-multiselect` (a native <details> wrapping a
 * <fieldset> of `.re-checkbox`es). The checkboxes are never proxied — they stay
 * the form value — so this only:
 *
 *   - mirrors the checked options into the summary's `__value` ("React, Vue"
 *     up to a cap, then "+K more"); empty restores the authored placeholder,
 *   - closes the panel on Escape (returning focus to the summary) and on an
 *     outside pointerdown, while open,
 *   - when `data-re-multiselect-required` is set, enforces ≥1 selection: mirrors
 *     `aria-invalid` onto the <fieldset> and `data-invalid` onto the host,
 *     reveals the `.re-validation-message`, and blocks the form submit.
 *
 * It rides the native `change` event (no custom "changed" event — `change`
 * already carries the checkbox). Native open/close + `aria-expanded` are left to
 * <details>/<summary>. Without this behavior the control still submits and works
 * as a native disclosure of checkboxes; the summary just shows the placeholder
 * instead of the live selection.
 *
 *   <details class="re-multiselect" data-re-multiselect data-re-multiselect-required>
 *     <summary class="re-multiselect__summary" aria-labelledby="fw-label fw-value">
 *       <span class="re-multiselect__value" id="fw-value" data-placeholder>Select…</span>
 *     </summary>
 *     <fieldset class="re-multiselect__panel" aria-describedby="fw-error">…</fieldset>
 *   </details>
 *   <span class="re-validation-message" id="fw-error" hidden>Pick at least one.</span>
 *
 * @typedef {{ destroy: () => void }} Controller
 */

/** Labels past this many are collapsed to "+K more" in the summary. */
const MAX_LABELS = 2;

/**
 * @param {Document | Element | ShadowRoot} [root=document]
 * @returns {Controller}
 */
export function enhanceMultiSelect(root = document) {
  if (root == null) {
    throw new TypeError("enhanceMultiSelect: root must be a Document, Element, or ShadowRoot");
  }
  /** @type {Array<() => void>} */
  const cleanups = [];
  const wire = (host) => cleanups.push(wireOne(/** @type {HTMLDetailsElement} */ (host)));

  if (root instanceof Element && root.matches?.("[data-re-multiselect]")) wire(root);
  root.querySelectorAll("[data-re-multiselect]").forEach(wire);

  return {
    destroy() {
      while (cleanups.length) cleanups.pop()?.();
    },
  };
}

/**
 * @param {HTMLDetailsElement} host
 * @returns {() => void}
 */
function wireOne(host) {
  if (host.hasAttribute("data-re-multiselect-ready")) return () => {}; // idempotent
  const summary = /** @type {HTMLElement | null} */ (
    host.querySelector(".re-multiselect__summary")
  );
  const valueEl = /** @type {HTMLElement | null} */ (host.querySelector(".re-multiselect__value"));
  const fieldset = /** @type {HTMLFieldSetElement | null} */ (
    host.querySelector(".re-multiselect__panel")
  );
  if (!summary || !valueEl || !fieldset) return () => {};
  host.setAttribute("data-re-multiselect-ready", "");

  // The validation message lives OUTSIDE <details> (a sibling) so it stays
  // visible when the control is collapsed — exactly when a failed-submit error
  // must show. Find it via the fieldset's aria-describedby.
  const describedBy = (fieldset.getAttribute("aria-describedby") || "").trim().split(/\s+/)[0];
  const message = describedBy ? host.ownerDocument.getElementById(describedBy) : null;
  const required = host.hasAttribute("data-re-multiselect-required");
  const placeholder = (valueEl.textContent ?? "").trim(); // stash the authored placeholder

  // A polite live region for the selection count. The summary value is the
  // control's accessible NAME (aria-labelledby), which screen readers don't
  // re-announce when it changes on an unfocused element — so toggling boxes
  // while the panel is open would otherwise be silent. Lives as a sibling of
  // the host so it stays rendered while the panel is collapsed.
  const liveRegion = host.ownerDocument.createElement("span");
  liveRegion.className = "re-sr-only";
  liveRegion.setAttribute("aria-live", "polite");
  host.after(liveRegion);
  // Make the required-error message an alert so its reveal is announced (it is
  // not focused — onSubmit moves focus to the summary, see validate()).
  if (message) message.setAttribute("role", "alert");

  const boxes = () =>
    /** @type {HTMLInputElement[]} */ (
      Array.from(host.querySelectorAll('.re-multiselect__option input[type="checkbox"]'))
    );

  /** Reflect the checked options into the summary value. */
  const render = () => {
    const labels = boxes()
      .filter((b) => b.checked)
      .map(labelText);
    // Announce the plain count (the visual value abbreviates to "+K more").
    liveRegion.textContent = labels.length ? `${labels.length} selected` : "";
    if (labels.length === 0) {
      valueEl.textContent = placeholder;
      valueEl.setAttribute("data-placeholder", "");
      return;
    }
    valueEl.removeAttribute("data-placeholder");
    valueEl.textContent =
      labels.length <= MAX_LABELS
        ? labels.join(", ")
        : `${labels.slice(0, MAX_LABELS).join(", ")} +${labels.length - MAX_LABELS} more`;
  };

  /** Apply the ≥1 constraint. `reveal` shows the message (after interaction). */
  const validate = (reveal) => {
    if (!required) return false;
    const invalid = boxes().every((b) => !b.checked);
    host.toggleAttribute("data-invalid", invalid);
    // Mirror invalid + the error association onto BOTH the fieldset (the group)
    // and the summary — onSubmit moves focus to the summary, so it must be the
    // node that announces "invalid" and carries aria-describedby to the message.
    if (invalid) {
      fieldset.setAttribute("aria-invalid", "true");
      summary.setAttribute("aria-invalid", "true");
      if (message) summary.setAttribute("aria-describedby", message.id);
    } else {
      fieldset.removeAttribute("aria-invalid");
      summary.removeAttribute("aria-invalid");
      summary.removeAttribute("aria-describedby");
    }
    if (message && reveal) message.hidden = !invalid;
    return invalid;
  };

  // --- listeners ---------------------------------------------------------
  const onChange = (e) => {
    if (!(e.target instanceof HTMLInputElement) || e.target.type !== "checkbox") return;
    render();
    validate(true);
  };
  host.addEventListener("change", onChange);

  const onKeyDown = (e) => {
    if (e.key === "Escape" && host.open) {
      host.open = false;
      summary.focus();
    }
  };
  host.addEventListener("keydown", onKeyDown);

  const onPointerDown = (e) => {
    if (host.open && e.target instanceof Node && !host.contains(e.target)) host.open = false;
  };
  document.addEventListener("pointerdown", onPointerDown);

  const form = boxes()[0]?.form ?? host.closest("form");
  const onSubmit = (e) => {
    if (validate(true)) {
      e.preventDefault();
      // Leave it collapsed; the message shows below the control. Focusing the
      // summary points the user at what to fix without overlapping the panel.
      summary.focus();
    }
  };
  const onReset = () =>
    queueMicrotask(() => {
      host.toggleAttribute("data-invalid", false);
      fieldset.removeAttribute("aria-invalid");
      if (message) message.hidden = true;
      render();
    });
  form?.addEventListener("submit", onSubmit);
  form?.addEventListener("reset", onReset);

  render();

  return () => {
    host.removeEventListener("change", onChange);
    host.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("pointerdown", onPointerDown);
    form?.removeEventListener("submit", onSubmit);
    form?.removeEventListener("reset", onReset);
    host.removeAttribute("data-re-multiselect-ready");
    host.removeAttribute("data-invalid");
    fieldset.removeAttribute("aria-invalid");
    summary.removeAttribute("aria-invalid");
    summary.removeAttribute("aria-describedby");
    if (message) {
      message.hidden = true;
      message.removeAttribute("role");
    }
    liveRegion.remove();
    // Restore the authored placeholder; leave the user's checkbox state intact.
    valueEl.setAttribute("data-placeholder", "");
    valueEl.textContent = placeholder;
  };
}

/**
 * The visible text of a checkbox's option label (the checkbox itself adds none).
 * @param {HTMLInputElement} box
 */
function labelText(box) {
  const label = box.closest("label");
  return ((label?.textContent ?? box.value) || "").trim().replace(/\s+/g, " ");
}
