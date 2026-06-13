/**
 * enhanceToolbar
 * --------------
 * Layers the ARIA toolbar keyboard model over a `role="toolbar"` band: ONE Tab
 * stop for the whole toolbar, Arrow keys rove focus between controls, Home/End
 * jump to the ends. Without JS the toolbar is fully usable — every control is a
 * native button, so it is just N Tab stops; this only collapses them to one.
 *
 *   <div class="re-toolbar" role="toolbar" aria-label="Format" data-re-toolbar>
 *     <button class="re-button" data-variant="ghost" aria-pressed="true">…</button>
 *     <button class="re-button" data-variant="ghost">…</button>
 *   </div>
 *   import { enhanceToolbar } from "@relements/core/behaviors/toolbar";
 *   const c = enhanceToolbar(document);
 *   c.destroy();
 *
 * Keyboard:
 *   ArrowLeft / ArrowRight  — rove (horizontal toolbars)
 *   ArrowUp   / ArrowDown   — rove (data-orientation="vertical")
 *   Home / End              — first / last (clamped at the ends; no wrap)
 *
 * Composes with a hosted menu (`.re-menu` / `[data-re-menu]`): the menu trigger
 * is a single toolbar item, but the controls inside its `role="menu"` panel are
 * NOT roving items, and while the menu is open the toolbar yields key handling
 * to `enhanceMenuButton`. Discoverable-but-disabled items must use
 * `aria-disabled="true"` (focusable); native `disabled` controls are skipped.
 */

/** @typedef {{ destroy: () => void }} Controller */

// `[tabindex]:not([tabindex^="-"])` so a tabindex="-1" control (focusable only
// programmatically, deliberately out of any sequence) isn't pulled into roving.
const FOCUSABLE =
  'button, [href], input:not([type=hidden]), select, [tabindex]:not([tabindex^="-"])';
// Controls inside a nested menu/popover panel belong to that widget, not the
// toolbar — only the trigger is a toolbar item.
const NESTED_PANEL = '[role="menu"], [role="menubar"], [popover]';

/**
 * @param {Document | Element | ShadowRoot} [root=document]
 * @returns {Controller}
 */
export function enhanceToolbar(root = document) {
  if (root == null) {
    throw new TypeError("enhanceToolbar: root must be a Document, Element, or ShadowRoot");
  }

  /** @type {Array<{ host: Element; cleanup: () => void }>} */
  const hosts = [];

  if (root instanceof Element && /** @type {Element} */ (root).matches?.("[data-re-toolbar]")) {
    hosts.push({ host: root, cleanup: wireOne(/** @type {HTMLElement} */ (root)) });
  }
  root.querySelectorAll("[data-re-toolbar]").forEach((host) => {
    hosts.push({ host, cleanup: wireOne(/** @type {HTMLElement} */ (host)) });
  });

  return {
    destroy() {
      while (hosts.length) hosts.pop()?.cleanup();
    },
  };
}

/**
 * @param {HTMLElement} host
 * @returns {() => void}
 */
function wireOne(host) {
  if (host.hasAttribute("data-re-toolbar-ready")) return () => {};

  /** Direct toolbar controls, in DOM order. Excludes native-disabled controls
   * and anything inside a nested menu/popover panel (the panel's owner widget
   * governs those); the menu/popover trigger itself stays as one item. */
  const items = () =>
    /** @type {HTMLElement[]} */ (Array.from(host.querySelectorAll(FOCUSABLE))).filter((el) => {
      if (/** @type {HTMLButtonElement} */ (el).disabled) return false;
      const panel = el.closest(NESTED_PANEL);
      return !(panel && panel !== host && host.contains(panel));
    });

  const current = items();
  if (current.length === 0) {
    host.setAttribute("data-re-toolbar-ready", "");
    return () => host.removeAttribute("data-re-toolbar-ready");
  }

  const vertical = host.getAttribute("data-orientation") === "vertical";
  if (vertical) host.setAttribute("aria-orientation", "vertical");

  // Snapshot original tabindex so destroy() is a true round-trip to the authored
  // baseline (restore the value, or remove if there was none) rather than a
  // one-way strip.
  /** @type {Map<HTMLElement, string | null>} */
  const originalTabindex = new Map();
  for (const el of current) originalTabindex.set(el, el.getAttribute("tabindex"));

  // One Tab stop: keep an author-marked tabindex="0" if present, else the first.
  const initial = current.find((el) => el.getAttribute("tabindex") === "0") ?? current[0];
  for (const el of current) el.tabIndex = el === initial ? 0 : -1;

  host.setAttribute("data-re-toolbar-ready", "");

  /** @param {HTMLElement} item */
  const setActive = (item) => {
    for (const el of items()) el.tabIndex = el === item ? 0 : -1;
  };

  /** Roving memory: focusing a control makes it the sole Tab stop. */
  const onFocusin = (/** @type {FocusEvent} */ event) => {
    const t = /** @type {HTMLElement | null} */ (event.target);
    if (t && items().includes(t)) setActive(t);
  };

  const onKey = (/** @type {KeyboardEvent} */ event) => {
    const target = /** @type {HTMLElement | null} */ (event.target);
    // Leave keyboard shortcuts to the browser/app.
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    // Native text-entry, range and select controls keep their own Arrow/Home/End
    // (caret movement, value stepping, option selection) — don't hijack them.
    if (isEditable(target)) return;
    // While a hosted menu/popup is open (focus inside its panel), it owns keys.
    if (target?.closest(NESTED_PANEL)) return;
    // A menu/popup trigger owns its open keys (ArrowDown/Up); don't rove off it
    // before it opens — matters in a vertical toolbar where those are rove keys.
    if (
      target?.matches("[aria-haspopup]") &&
      (event.key === "ArrowDown" || event.key === "ArrowUp")
    )
      return;

    const list = items();
    const idx = target ? list.indexOf(target) : -1;
    if (idx === -1) return;

    // Horizontal arrows follow the visual reading direction, so they mirror in
    // RTL (Right = previous, Left = next). Vertical is unaffected.
    const rtl = !vertical && getComputedStyle(host).direction === "rtl";
    const next = vertical ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
    const prev = vertical ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
    let nextIdx = idx;
    switch (event.key) {
      case next:
        nextIdx = Math.min(idx + 1, list.length - 1);
        break;
      case prev:
        nextIdx = Math.max(idx - 1, 0);
        break;
      case "Home":
        nextIdx = 0;
        break;
      case "End":
        nextIdx = list.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    if (nextIdx !== idx) {
      setActive(list[nextIdx]);
      list[nextIdx].focus();
    }
  };

  host.addEventListener("focusin", /** @type {EventListener} */ (onFocusin));
  host.addEventListener("keydown", /** @type {EventListener} */ (onKey));

  return () => {
    host.removeEventListener("focusin", /** @type {EventListener} */ (onFocusin));
    host.removeEventListener("keydown", /** @type {EventListener} */ (onKey));
    // Restore the authored baseline (true round-trip): re-set each control's
    // original tabindex, or remove it if it had none — back to N native Tab
    // stops, not a dead one-Tab-stop structure.
    for (const el of new Set([...originalTabindex.keys(), ...items()])) {
      const orig = originalTabindex.get(el);
      if (orig == null) el.removeAttribute("tabindex");
      else el.setAttribute("tabindex", orig);
    }
    if (vertical) host.removeAttribute("aria-orientation");
    host.removeAttribute("data-re-toolbar-ready");
  };
}

/**
 * Native text-entry / range / select controls that own their Arrow & Home/End
 * keys and must not be hijacked by the toolbar's roving handler.
 * @param {HTMLElement | null} el
 * @returns {boolean}
 */
function isEditable(el) {
  if (!el) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag === "INPUT") {
    const type = /** @type {HTMLInputElement} */ (el.type || "text").toLowerCase();
    return !["button", "submit", "reset", "checkbox", "radio", "image", "file", "hidden"].includes(
      type,
    );
  }
  return false;
}
