/**
 * enhanceNumberStepper
 * --------------------
 * Wires large +/- buttons to a native number input. The input IS the spinbutton
 * (role=spinbutton is implicit on <input type="number">) — this adds nothing to
 * its semantics, it only gives pointer users bigger step targets. Arrow keys,
 * min/max/step, and form value stay 100% native.
 *
 *   <div class="re-input-group">
 *     <button type="button" class="re-input-group__action"
 *             data-re-number-step="-1" aria-label="Decrease" tabindex="-1">−</button>
 *     <input type="number" class="re-input" data-re-number min="0" max="10" step="1" />
 *     <button type="button" class="re-input-group__action"
 *             data-re-number-step="1" aria-label="Increase" tabindex="-1">+</button>
 *   </div>
 *
 * The input is the host (`data-re-number`). Step buttons are found in the same
 * `.re-input-group`. Pressing one calls native stepUp()/stepDown() and then
 * dispatches `input` + `change` (which stepUp/Down do NOT fire), so frameworks
 * observe the change like typing. Buttons are tabindex=-1 (the input is the tab
 * stop; arrows already step) and are disabled at the min/max bound and when the
 * input is disabled/readonly.
 *
 * Without JavaScript the field is a normal number input with its native
 * spinner; the buttons are inert.
 */

/** @typedef {{ destroy: () => void }} Controller */

/**
 * @param {Document | Element | ShadowRoot} [root=document]
 * @returns {Controller}
 */
export function enhanceNumberStepper(root = document) {
  if (root == null) {
    throw new TypeError("enhanceNumberStepper: root must be a Document, Element, or ShadowRoot");
  }

  /** @type {Array<() => void>} */
  const cleanups = [];

  if (root instanceof Element && root.matches?.("input[data-re-number]")) {
    cleanups.push(wireOne(/** @type {HTMLInputElement} */ (root)));
  }
  root.querySelectorAll("input[data-re-number]").forEach((input) => {
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
  const group = input.closest(".re-input-group");
  if (!group) return () => {};
  const buttons = /** @type {HTMLButtonElement[]} */ (
    Array.from(group.querySelectorAll("[data-re-number-step]"))
  );
  if (!buttons.length) return () => {};
  // Idempotency guard — re-enhancing would double-bind and double-step.
  if (input.hasAttribute("data-re-number-ready")) return () => {};
  // `data-re-number-ready` is the JS-applied marker. The spinner-suppression
  // CSS is gated on it (not the declarative `data-re-number`), so a no-JS page
  // keeps the native spinner instead of losing it with no working buttons.
  input.setAttribute("data-re-number-ready", "");

  const num = (v, fallback) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  };

  /** Reflect whether stepping further is possible, per button direction. */
  const syncBounds = () => {
    const blocked = input.disabled || input.readOnly;
    const value = num(input.value, NaN);
    const min = input.hasAttribute("min") ? num(input.min, -Infinity) : -Infinity;
    const max = input.hasAttribute("max") ? num(input.max, Infinity) : Infinity;
    for (const btn of buttons) {
      const dir = num(btn.dataset.reNumberStep, 0);
      const atBound =
        Number.isFinite(value) && ((dir > 0 && value >= max) || (dir < 0 && value <= min));
      btn.disabled = blocked || atBound;
    }
  };

  /** @param {number} dir */
  const step = (dir) => {
    if (input.disabled || input.readOnly) return;
    if (dir > 0) input.stepUp();
    else input.stepDown();
    // stepUp/stepDown change .value WITHOUT firing events.
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    syncBounds();
  };

  /** @type {Array<[HTMLButtonElement, (e: Event) => void]>} */
  const handlers = [];
  for (const btn of buttons) {
    const onClick = () => step(num(btn.dataset.reNumberStep, 0));
    btn.addEventListener("click", onClick);
    handlers.push([btn, onClick]);
  }
  const onInput = () => syncBounds();
  input.addEventListener("input", onInput);

  syncBounds();

  return () => {
    for (const [btn, fn] of handlers) btn.removeEventListener("click", fn);
    input.removeEventListener("input", onInput);
    input.removeAttribute("data-re-number-ready");
  };
}
