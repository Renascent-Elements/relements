/**
 * enhancePasswordToggle
 * ---------------------
 * Wires a show/hide button for a password field. The base markup is a normal
 * password input inside an input group; the button is a real <button> that
 * works as a labelled control — JavaScript only flips the input type.
 *
 *   <div class="re-input-group">
 *     <input type="password" class="re-input" id="pw" />
 *     <button type="button" class="re-input-group__action"
 *             data-re-password-toggle aria-controls="pw"
 *             aria-label="Show password" hidden>
 *       <svg data-when="hidden">…eye…</svg>
 *       <svg data-when="shown" hidden>…eye-off…</svg>
 *     </button>
 *   </div>
 *
 * The toggle button is the host (`data-re-password-toggle`). Its target is the
 * input referenced by `aria-controls`, or the `.re-input` in the same
 * `.re-input-group`. Toggling:
 *   - flips input.type between "password" and "text",
 *   - reflects `aria-pressed` (the accessible NAME stays "Show password" — a
 *     toggle button conveys on/off via pressed, not by renaming),
 *   - sets `data-revealed` on the button and toggles `[data-when]` icons,
 *   - preserves focus and caret position (type changes can reset selection).
 *
 * The button is a JS-only affordance, so the base markup authors it `hidden`;
 * the enhancer un-hides it (and re-hides on destroy). With no JavaScript the
 * field stays a normal, fully usable password input and no dead control is
 * shown or announced.
 */

/** @typedef {{ destroy: () => void }} Controller */

/**
 * @param {Document | Element | ShadowRoot} [root=document]
 * @returns {Controller}
 */
export function enhancePasswordToggle(root = document) {
  if (root == null) {
    throw new TypeError("enhancePasswordToggle: root must be a Document, Element, or ShadowRoot");
  }

  /** @type {Array<() => void>} */
  const cleanups = [];

  if (root instanceof Element && root.matches?.("[data-re-password-toggle]")) {
    cleanups.push(wireOne(/** @type {HTMLElement} */ (root)));
  }
  root.querySelectorAll("[data-re-password-toggle]").forEach((btn) => {
    cleanups.push(wireOne(/** @type {HTMLElement} */ (btn)));
  });

  return {
    destroy() {
      while (cleanups.length) cleanups.pop()?.();
    },
  };
}

/**
 * @param {HTMLElement} button
 * @returns {() => void}
 */
function wireOne(button) {
  const controls = button.getAttribute("aria-controls");
  const input = /** @type {HTMLInputElement | null} */ (
    controls
      ? button.ownerDocument.getElementById(controls)
      : (button.closest(".re-input-group")?.querySelector(".re-input") ?? null)
  );
  if (!input) return () => {};
  // Idempotency guard — re-enhancing would double-bind the click (net no-op)
  // and leak a listener that destroy() couldn't remove.
  if (button.hasAttribute("data-re-password-ready")) return () => {};
  button.setAttribute("data-re-password-ready", "");

  // The button is a JS-only affordance (a password field has no native reveal),
  // so the base markup authors it `hidden` to avoid announcing a dead control
  // with no JS. Un-hide it now that it works; restore on destroy.
  const wasHidden = button.hasAttribute("hidden");
  button.removeAttribute("hidden");

  // Toggle-button semantics: a STABLE accessible name ("Show password") plus
  // aria-pressed conveying the on/off state. (Swapping the name to "Hide…"
  // while also setting aria-pressed=true produces a contradictory announcement.)
  const sync = () => {
    const shown = input.type === "text";
    button.setAttribute("aria-pressed", String(shown));
    button.toggleAttribute("data-revealed", shown);
    // Use the attribute (not the .hidden property): these icons are <svg>, and
    // the `hidden` IDL property is defined on HTMLElement, not SVGElement — it
    // wouldn't reflect to the attribute, so the `[hidden]` CSS wouldn't apply.
    for (const icon of button.querySelectorAll("[data-when]")) {
      const when = /** @type {HTMLElement} */ (icon).dataset.when;
      icon.toggleAttribute("hidden", shown ? when !== "shown" : when !== "hidden");
    }
  };

  const onClick = () => {
    if (input.disabled) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    input.type = input.type === "password" ? "text" : "password";
    sync();
    // Restore caret + focus; the type change can drop the selection.
    input.focus();
    try {
      if (start !== null && end !== null) input.setSelectionRange(start, end);
    } catch {
      /* setSelectionRange throws on some input types; ignore. */
    }
  };

  if (!button.hasAttribute("aria-pressed")) button.setAttribute("aria-pressed", "false");
  sync();
  button.addEventListener("click", onClick);

  return () => {
    button.removeEventListener("click", onClick);
    button.removeAttribute("data-re-password-ready");
    if (wasHidden) button.setAttribute("hidden", "");
  };
}
