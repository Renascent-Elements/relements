/**
 * enhanceMenuButton
 * -----------------
 * ARIA menu-button pattern over markup like:
 *
 *   <div class="re-menu" data-re-menu>
 *     <button aria-haspopup="menu" aria-expanded="false" aria-controls="m-1" id="b-1">…</button>
 *     <div role="menu" id="m-1" aria-labelledby="b-1" hidden>
 *       <button role="menuitem">Rename</button>
 *       …
 *     </div>
 *   </div>
 *
 * Behavior:
 *   - Click the button toggles the menu.
 *   - ArrowDown opens the menu and focuses the first item.
 *   - Up/Down on items moves focus within the menu (wraps); `aria-disabled`
 *     items are skipped.
 *   - Home/End jump; first-character typeahead focuses a matching item.
 *   - Escape closes the menu and returns focus to the button.
 *   - Tab outside the menu closes it.
 *   - Clicking outside closes it.
 *
 * Dispatches `re-select` (bubbles, cancelable) when a menuitem is activated:
 *   detail = { item: HTMLElement, value: string }
 */

/** @typedef {{ destroy: () => void }} Controller */

/**
 * @param {Document | Element | ShadowRoot} [root=document]
 * @returns {Controller}
 */
export function enhanceMenuButton(root = document) {
  if (root == null) {
    throw new TypeError("enhanceMenuButton: root must be a Document, Element, or ShadowRoot");
  }

  /** @type {Array<() => void>} */
  const cleanups = [];

  if (root instanceof Element && /** @type {Element} */ (root).matches?.("[data-re-menu]")) {
    cleanups.push(wireOne(/** @type {HTMLElement} */ (root)));
  }

  /** @type {NodeListOf<Element>} */
  const hosts = root.querySelectorAll("[data-re-menu]");
  hosts.forEach((host) => {
    cleanups.push(wireOne(/** @type {HTMLElement} */ (host)));
  });

  return {
    destroy() {
      while (cleanups.length) {
        const fn = cleanups.pop();
        fn?.();
      }
    },
  };
}

/**
 * @param {HTMLElement} host
 * @returns {() => void}
 */
function wireOne(host) {
  const button = /** @type {HTMLElement | null} */ (
    host.querySelector('[aria-haspopup="menu"], [aria-haspopup="true"]')
  );
  const panel = /** @type {HTMLElement | null} */ (host.querySelector('[role="menu"]'));
  if (!button || !panel) return () => {};

  const items = () =>
    /** @type {HTMLElement[]} */ (
      Array.from(
        panel.querySelectorAll('[role="menuitem"]:not([disabled]):not([aria-disabled="true"])'),
      )
    );

  // First-character typeahead (multi-char buffer, mirrors context-menu).
  let typeBuf = "";
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let typeTimer;

  const isOpen = () => button.getAttribute("aria-expanded") === "true";

  /** @param {boolean} open */
  const setOpen = (open) => {
    button.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
  };

  /** @param {{ focusFirst?: boolean }} [opts] */
  const openMenu = (opts = {}) => {
    if (isOpen()) return;
    setOpen(true);
    if (opts.focusFirst) {
      const first = items()[0];
      first?.focus();
    }
  };

  /** @param {{ returnFocus?: boolean }} [opts] */
  const closeMenu = (opts = {}) => {
    if (!isOpen()) return;
    setOpen(false);
    if (opts.returnFocus) button.focus();
  };

  /** @param {Event} event */
  const onButtonClick = (event) => {
    event.stopPropagation();
    if (isOpen()) closeMenu();
    else openMenu({ focusFirst: false });
  };

  /** @param {KeyboardEvent} event */
  const onButtonKey = (event) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMenu({ focusFirst: true });
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openMenu();
      const all = items();
      all[all.length - 1]?.focus();
    }
  };

  /** @param {KeyboardEvent} event */
  const onPanelKey = (event) => {
    const all = items();
    const active = document.activeElement;
    const idx = all.findIndex((el) => el === active);
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        const next = all[(idx + 1 + all.length) % all.length];
        next?.focus();
        return;
      }
      case "ArrowUp": {
        event.preventDefault();
        const prev = all[(idx - 1 + all.length) % all.length];
        prev?.focus();
        return;
      }
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
        closeMenu({ returnFocus: true });
        return;
      case "Tab":
        closeMenu();
        return;
    }
    // First-character typeahead: focus the first item whose label starts with
    // the recently-typed characters.
    if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
      typeBuf += event.key.toLowerCase();
      clearTimeout(typeTimer);
      typeTimer = setTimeout(() => (typeBuf = ""), 500);
      const match = all.find((el) =>
        (el.textContent || "").trim().toLowerCase().startsWith(typeBuf),
      );
      if (match) {
        event.preventDefault();
        match.focus();
      }
    }
  };

  /** @param {Event} event */
  const onPanelClick = (event) => {
    const target = /** @type {Element | null} */ (event.target);
    if (!target) return;
    const item = target.closest('[role="menuitem"]');
    if (!item) return;
    // Disabled items are inert to clicks too (not just keyboard nav).
    if (item.matches('[disabled], [aria-disabled="true"]')) return;
    const value =
      /** @type {HTMLElement} */ (item).dataset.value ??
      /** @type {HTMLElement} */ (item).textContent?.trim() ??
      "";
    const allowed = host.dispatchEvent(
      new CustomEvent("re-select", {
        bubbles: true,
        cancelable: true,
        detail: { item, value },
      }),
    );
    if (allowed) closeMenu({ returnFocus: true });
  };

  /** @param {Event} event */
  const onOutsideClick = (event) => {
    if (!isOpen()) return;
    const t = /** @type {Node | null} */ (event.target);
    if (t && host.contains(t)) return;
    closeMenu();
  };

  button.addEventListener("click", onButtonClick);
  button.addEventListener("keydown", /** @type {EventListener} */ (onButtonKey));
  panel.addEventListener("keydown", /** @type {EventListener} */ (onPanelKey));
  panel.addEventListener("click", onPanelClick);
  document.addEventListener("click", onOutsideClick);

  return () => {
    clearTimeout(typeTimer);
    button.removeEventListener("click", onButtonClick);
    button.removeEventListener("keydown", /** @type {EventListener} */ (onButtonKey));
    panel.removeEventListener("keydown", /** @type {EventListener} */ (onPanelKey));
    panel.removeEventListener("click", onPanelClick);
    document.removeEventListener("click", onOutsideClick);
  };
}
