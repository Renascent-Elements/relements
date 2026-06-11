/**
 * enhanceCombobox
 * ---------------
 * Opt-in styled suggestion list over the native combobox base:
 *
 *   <input class="re-input re-combobox" list="fruits" data-re-combobox />
 *   <datalist id="fruits">
 *     <option value="Apple"></option>
 *   </datalist>
 *
 * Without JavaScript (or without the Popover API) the markup keeps the
 * browser's native datalist popup. Enhancing an input:
 *   - removes `list` (suppresses the native popup) but keeps reading the
 *     same <datalist> as the live data source,
 *   - renders a styled `role="listbox"` popover under the input that is
 *     never narrower than the input (it may grow for longer options),
 *   - implements the ARIA editable-combobox pattern: typing filters
 *     (case-insensitive substring, like the native popup), Arrow keys move
 *     the highlight, Enter commits, Escape closes, focus stays in the input
 *     (aria-activedescendant).
 *
 * Committing a value sets input.value and dispatches `input` and `change`
 * events (bubbling), so frameworks observe it like user typing.
 */

/** @typedef {{ destroy: () => void }} Controller */

let uid = 0;

/**
 * @param {Document | Element | ShadowRoot} [root=document]
 * @returns {Controller}
 */
export function enhanceCombobox(root = document) {
  if (root == null) {
    throw new TypeError("enhanceCombobox: root must be a Document, Element, or ShadowRoot");
  }

  /** @type {Array<() => void>} */
  const cleanups = [];

  if (root instanceof Element && root.matches?.("input[data-re-combobox]")) {
    cleanups.push(wireOne(/** @type {HTMLInputElement} */ (root)));
  }

  /** @type {NodeListOf<HTMLInputElement>} */
  const hosts = root.querySelectorAll("input[data-re-combobox]");
  hosts.forEach((input) => {
    cleanups.push(wireOne(input));
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
 * @param {HTMLInputElement} input
 * @returns {() => void}
 */
function wireOne(input) {
  const datalistId = input.getAttribute("list");
  const datalist = datalistId ? input.ownerDocument.getElementById(datalistId) : null;
  // No data source, already enhanced, or no Popover API: leave the native
  // behavior in place.
  if (!datalist || input.hasAttribute("data-re-combobox-enhanced")) return () => {};
  if (typeof HTMLElement.prototype.showPopover !== "function") return () => {};

  const doc = input.ownerDocument;
  const listId = `re-combobox-${++uid}`;

  input.removeAttribute("list");
  input.setAttribute("data-re-combobox-enhanced", "");
  if (!input.hasAttribute("autocomplete")) input.setAttribute("autocomplete", "off");
  input.setAttribute("role", "combobox");
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-expanded", "false");
  input.setAttribute("aria-controls", listId);

  const list = doc.createElement("div");
  list.className = "re-combobox__list";
  list.id = listId;
  list.setAttribute("role", "listbox");
  list.setAttribute("popover", "manual");
  input.insertAdjacentElement("afterend", list);

  const isOpen = () => input.getAttribute("aria-expanded") === "true";

  const options = () =>
    /** @type {HTMLElement[]} */ (Array.from(list.querySelectorAll('[role="option"]')));

  /** @param {HTMLElement | null} option */
  const setActive = (option) => {
    for (const el of options()) el.setAttribute("aria-selected", String(el === option));
    if (option) {
      input.setAttribute("aria-activedescendant", option.id);
      option.scrollIntoView({ block: "nearest" });
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  };

  const active = () => {
    const id = input.getAttribute("aria-activedescendant");
    return id ? (options().find((el) => el.id === id) ?? null) : null;
  };

  /** Rebuild the option list from the live <datalist> for the query. */
  const render = () => {
    const query = input.value.trim().toLowerCase();
    list.textContent = "";
    let i = 0;
    for (const opt of datalist.querySelectorAll("option:not([disabled])")) {
      const value = /** @type {HTMLOptionElement} */ (opt).value;
      const label = opt.getAttribute("label") || opt.textContent?.trim() || "";
      const text = label || value;
      if (query && !value.toLowerCase().includes(query) && !label.toLowerCase().includes(query)) {
        continue;
      }
      const el = doc.createElement("div");
      el.className = "re-combobox__option";
      el.id = `${listId}-opt-${i++}`;
      el.setAttribute("role", "option");
      el.setAttribute("aria-selected", "false");
      el.dataset.value = value;
      el.textContent = text;
      list.append(el);
    }
    return i;
  };

  /** Never narrower than the input; clamped to the viewport; flips above
      when there is more room there. */
  const position = () => {
    const rect = input.getBoundingClientRect();
    const win = doc.defaultView ?? window;
    list.style.minInlineSize = `${rect.width}px`;
    const listRect = list.getBoundingClientRect();
    let left = rect.left;
    if (left + listRect.width > win.innerWidth - 8) {
      left = Math.max(8, win.innerWidth - 8 - listRect.width);
    }
    const below = win.innerHeight - rect.bottom;
    const above = rect.top;
    const openUp = below < listRect.height + 8 && above > below;
    list.style.left = `${left}px`;
    if (openUp) {
      list.style.top = "auto";
      list.style.bottom = `${win.innerHeight - rect.top + 4}px`;
    } else {
      list.style.bottom = "auto";
      list.style.top = `${rect.bottom + 4}px`;
    }
  };

  const open = () => {
    if (render() === 0) {
      close();
      return;
    }
    setActive(null);
    if (!list.matches(":popover-open")) list.showPopover();
    position();
    input.setAttribute("aria-expanded", "true");
    win().addEventListener("scroll", position, { capture: true, passive: true });
    win().addEventListener("resize", position, { passive: true });
  };

  const close = () => {
    if (list.matches(":popover-open")) list.hidePopover();
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    win().removeEventListener("scroll", position, { capture: true });
    win().removeEventListener("resize", position);
  };

  const win = () => doc.defaultView ?? window;

  /** @param {HTMLElement} option */
  const commit = (option) => {
    input.value = option.dataset.value ?? "";
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    close();
  };

  /** @param {1 | -1} dir */
  const move = (dir) => {
    const all = options();
    if (!all.length) return;
    const idx = all.indexOf(/** @type {HTMLElement} */ (active()));
    const next = all[(idx + dir + all.length) % all.length];
    setActive(next);
  };

  const onInput = () => open();

  const onClick = () => {
    if (!isOpen()) open();
  };

  /** @param {KeyboardEvent} event */
  const onKeydown = (event) => {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();
        if (!isOpen()) open();
        move(event.key === "ArrowDown" ? 1 : -1);
        return;
      }
      case "Enter": {
        const current = active();
        if (isOpen() && current) {
          event.preventDefault();
          commit(current);
        }
        return;
      }
      case "Escape": {
        if (isOpen()) {
          event.preventDefault();
          close();
        }
        return;
      }
      case "Tab":
        close();
        return;
    }
  };

  /** @param {PointerEvent} event */
  const onListPointerdown = (event) => {
    // Let scrollbar drags through untouched.
    const rect = list.getBoundingClientRect();
    if (event.clientX > rect.left + list.clientLeft + list.clientWidth) return;
    // Keep focus in the input; commit on press like the native popup.
    event.preventDefault();
    const option = /** @type {Element | null} */ (event.target)?.closest('[role="option"]');
    if (option) commit(/** @type {HTMLElement} */ (option));
  };

  /** @param {Event} event */
  const onListPointerover = (event) => {
    const option = /** @type {Element | null} */ (event.target)?.closest('[role="option"]');
    if (option) setActive(/** @type {HTMLElement} */ (option));
  };

  const onFocusout = () => close();

  /** @param {Event} event */
  const onOutsidePointerdown = (event) => {
    if (!isOpen()) return;
    const t = /** @type {Node | null} */ (event.target);
    if (t && (input.contains(t) || list.contains(t))) return;
    close();
  };

  input.addEventListener("input", onInput);
  input.addEventListener("click", onClick);
  input.addEventListener("keydown", onKeydown);
  input.addEventListener("focusout", onFocusout);
  list.addEventListener("pointerdown", onListPointerdown);
  list.addEventListener("pointerover", onListPointerover);
  doc.addEventListener("pointerdown", onOutsidePointerdown);

  return () => {
    close();
    input.removeEventListener("input", onInput);
    input.removeEventListener("click", onClick);
    input.removeEventListener("keydown", onKeydown);
    input.removeEventListener("focusout", onFocusout);
    list.removeEventListener("pointerdown", onListPointerdown);
    list.removeEventListener("pointerover", onListPointerover);
    doc.removeEventListener("pointerdown", onOutsidePointerdown);
    list.remove();
    if (datalistId) input.setAttribute("list", datalistId);
    input.removeAttribute("data-re-combobox-enhanced");
    input.removeAttribute("role");
    input.removeAttribute("aria-autocomplete");
    input.removeAttribute("aria-expanded");
    input.removeAttribute("aria-controls");
  };
}
