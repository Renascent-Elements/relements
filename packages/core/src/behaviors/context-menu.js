/**
 * enhanceContextMenu
 * ------------------
 * Opens a styled menu at the pointer on right-click, and on the ContextMenu key
 * / Shift+F10 anchored to the focused region. The panel reuses `.re-menu__panel`
 * markup (role=menu + role=menuitem). With NO JS the native browser context menu
 * is the fallback — this only preventDefaults the contextmenu event once wired.
 *
 *   <div data-re-context-menu="row-actions" tabindex="0">…</div>
 *   <div id="row-actions" class="re-menu__panel re-context-menu__panel" role="menu" hidden>
 *     <button class="re-menu__item" role="menuitem" data-value="open">Open</button>
 *   </div>
 *   import { enhanceContextMenu } from "@relements/core/behaviors/context-menu";
 *   enhanceContextMenu(document);
 *
 * Keyboard: Up/Down (wrap), Home/End, first-char typeahead, Escape/Tab close
 * (Escape returns focus to the region). Dispatches `re-select` (bubbles,
 * cancelable; detail = { item, value, originalEvent }) on the region — call
 * preventDefault() to keep the menu open. Fixed-position is the canonical path
 * (the Popover API ships above the browser floor).
 */

/** @typedef {{ destroy: () => void }} Controller */

/** @type {{ close: () => void } | null} */
let openMenu = null;

/**
 * @param {Document | Element | ShadowRoot} [root=document]
 * @returns {Controller}
 */
export function enhanceContextMenu(root = document) {
  if (root == null) {
    throw new TypeError("enhanceContextMenu: root must be a Document, Element, or ShadowRoot");
  }
  /** @type {Array<() => void>} */
  const cleanups = [];
  if (root instanceof Element && root.matches?.("[data-re-context-menu]")) {
    cleanups.push(wireOne(/** @type {HTMLElement} */ (root)));
  }
  root.querySelectorAll("[data-re-context-menu]").forEach((region) => {
    cleanups.push(wireOne(/** @type {HTMLElement} */ (region)));
  });
  return {
    destroy() {
      while (cleanups.length) cleanups.pop()?.();
    },
  };
}

/**
 * @param {HTMLElement} region
 * @returns {() => void}
 */
function wireOne(region) {
  // A hosted menu-button already owns this subtree.
  if (region.closest("[data-re-menu], re-menu")) return () => {};
  if (region.hasAttribute("data-re-context-menu-ready")) return () => {};

  const doc = region.ownerDocument;
  const panel = doc.getElementById(region.dataset.reContextMenu || "");
  if (!panel) return () => {};

  region.setAttribute("data-re-context-menu-ready", "");
  // Advertise the menu to AT (matches the menu-button pattern).
  const hadHaspopup = region.hasAttribute("aria-haspopup");
  const hadControls = region.hasAttribute("aria-controls");
  region.setAttribute("aria-haspopup", "menu");
  region.setAttribute("aria-controls", panel.id);
  let addedTabindex = false;
  let typeBuf = "";
  let typeTimer = /** @type {ReturnType<typeof setTimeout> | undefined} */ (undefined);

  const items = () =>
    /** @type {HTMLElement[]} */ (
      Array.from(
        panel.querySelectorAll('[role="menuitem"]:not([disabled]):not([aria-disabled="true"])'),
      )
    );
  const win = () => doc.defaultView ?? window;
  const isOpen = () => !panel.hidden;

  /** Place the panel at (x, y), clamped to the viewport, flipping up/left if needed. */
  const placeAt = (/** @type {number} */ x, /** @type {number} */ y) => {
    const w = win();
    const rtl = getComputedStyle(region).direction === "rtl";
    const r = panel.getBoundingClientRect();
    let left = rtl ? x - r.width : x;
    let top = y;
    if (left + r.width > w.innerWidth - 8) left = Math.max(8, w.innerWidth - 8 - r.width);
    if (left < 8) left = 8;
    if (top + r.height > w.innerHeight - 8) top = Math.max(8, y - r.height);
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
  };

  // Close on scroll/resize rather than chase the pointer — and return focus to
  // the region so a keyboard user isn't dropped to <body> (hiding the panel
  // would otherwise discard the focused menuitem's focus).
  const reposition = () => close({ returnFocus: true });

  /** @param {number} x @param {number} y */
  const open = (x, y) => {
    if (openMenu && openMenu !== ctl) openMenu.close();
    if (!region.hasAttribute("tabindex")) {
      region.setAttribute("tabindex", "-1");
      addedTabindex = true;
    }
    panel.hidden = false;
    placeAt(x, y);
    items()[0]?.focus();
    openMenu = ctl;
    // Defer the global listeners so the very gesture that opened us doesn't close us.
    setTimeout(() => {
      if (!isOpen()) return;
      doc.addEventListener("pointerdown", onOutside, true);
      win().addEventListener("scroll", reposition, { capture: true, passive: true });
      win().addEventListener("resize", reposition, { passive: true });
    }, 0);
  };

  /** @param {{ returnFocus?: boolean }} [opts] */
  const close = (opts = {}) => {
    if (!isOpen()) return;
    panel.hidden = true;
    doc.removeEventListener("pointerdown", onOutside, true);
    win().removeEventListener("scroll", reposition, { capture: true });
    win().removeEventListener("resize", reposition);
    if (openMenu === ctl) openMenu = null;
    // Focus BEFORE dropping any temporary tabindex — otherwise the region is no
    // longer focusable and focus falls to <body>.
    if (opts.returnFocus) region.focus();
    if (addedTabindex) {
      region.removeAttribute("tabindex");
      addedTabindex = false;
    }
  };

  const ctl = { close };

  /** @param {MouseEvent} event */
  const onContextMenu = (event) => {
    event.preventDefault();
    open(event.clientX, event.clientY);
  };

  /** @param {KeyboardEvent} event */
  const onRegionKey = (event) => {
    if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
      event.preventDefault();
      const rtl = getComputedStyle(region).direction === "rtl";
      const r = region.getBoundingClientRect();
      open(rtl ? r.right : r.left, r.bottom);
    }
  };

  /** @param {PointerEvent} event */
  const onOutside = (event) => {
    const t = /** @type {Node | null} */ (event.target);
    if (t && panel.contains(t)) return;
    close();
  };

  /** @param {KeyboardEvent} event */
  const onPanelKey = (event) => {
    const all = items();
    const idx = all.indexOf(/** @type {HTMLElement} */ (doc.activeElement));
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        all[(idx + 1 + all.length) % all.length]?.focus();
        return;
      case "ArrowUp":
        event.preventDefault();
        all[(idx - 1 + all.length) % all.length]?.focus();
        return;
      case "Home":
        event.preventDefault();
        all[0]?.focus();
        return;
      case "End":
        event.preventDefault();
        all[all.length - 1]?.focus();
        return;
      case "Escape":
        event.preventDefault();
        close({ returnFocus: true });
        return;
      case "Tab":
        // Return focus to the region (don't preventDefault) so native Tab
        // resumes from a defined point — the panel is position:fixed and
        // unrelated to the region's DOM position, so a stale menuitem focus
        // would leave Tab landing somewhere unpredictable.
        close({ returnFocus: true });
        return;
    }
    // Space activates the focused menuitem natively (it's a <button>) — let that
    // happen, and don't let the space character pollute the typeahead buffer.
    if (event.key === " ") return;
    // First-character typeahead.
    if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
      typeBuf += event.key.toLowerCase();
      clearTimeout(typeTimer);
      typeTimer = setTimeout(() => (typeBuf = ""), 500);
      const match = all.find((el) =>
        (el.textContent || "").trim().toLowerCase().startsWith(typeBuf),
      );
      match?.focus();
    }
  };

  /** @param {MouseEvent} event */
  const onPanelClick = (event) => {
    const item = /** @type {Element | null} */ (event.target)?.closest('[role="menuitem"]');
    if (!item || item.matches('[disabled], [aria-disabled="true"]')) return;
    const value = /** @type {HTMLElement} */ (item).dataset.value ?? item.textContent?.trim() ?? "";
    const allowed = region.dispatchEvent(
      new CustomEvent("re-select", {
        bubbles: true,
        cancelable: true,
        detail: { item, value, originalEvent: event },
      }),
    );
    if (allowed) close({ returnFocus: true });
  };

  region.addEventListener("contextmenu", onContextMenu);
  region.addEventListener("keydown", /** @type {EventListener} */ (onRegionKey));
  panel.addEventListener("keydown", /** @type {EventListener} */ (onPanelKey));
  panel.addEventListener("click", onPanelClick);

  return () => {
    close();
    clearTimeout(typeTimer);
    region.removeEventListener("contextmenu", onContextMenu);
    region.removeEventListener("keydown", /** @type {EventListener} */ (onRegionKey));
    panel.removeEventListener("keydown", /** @type {EventListener} */ (onPanelKey));
    panel.removeEventListener("click", onPanelClick);
    if (!hadHaspopup) region.removeAttribute("aria-haspopup");
    if (!hadControls) region.removeAttribute("aria-controls");
    region.removeAttribute("data-re-context-menu-ready");
  };
}
