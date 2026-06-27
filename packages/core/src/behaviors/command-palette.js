/**
 * enhanceCommandPalette
 * ---------------------
 * Turns a <dialog class="re-dialog re-command-palette"> into a filterable
 * command launcher. The modal lifecycle is the EXISTING enhanceDialog (the
 * trigger uses data-re-dialog-trigger/-target; Escape/backdrop/focus-return are
 * native). This adds: the combobox/listbox ARIA (applied here, NOT shipped in
 * static markup), type-to-filter, arrow-key (+ Home/End) activedescendant navigation, single
 * activation path, and an optional global hotkey.
 *
 *   <button data-re-dialog-trigger data-re-dialog-target="cmdk">Search…</button>
 *   <dialog id="cmdk" class="re-dialog re-command-palette" data-re-command-palette
 *           data-re-command-hotkey="mod+k" aria-label="Command palette"> … </dialog>
 *   import { enhanceCommandPalette } from "@relements/core/behaviors/command-palette";
 *   enhanceCommandPalette(document);
 *
 * Activation dispatches `re-command` (bubbles, cancelable) on the dialog with
 * detail = { command, href, option }; if not prevented and the row is a link,
 * it navigates. No-JS baseline: a dialog with a searchable list of real
 * links/buttons (no widget ARIA announced without behavior to back it).
 */

/** @typedef {{ destroy: () => void }} Controller */

let uid = 0;

/**
 * @param {Document | Element | ShadowRoot} [root=document]
 * @returns {Controller}
 */
export function enhanceCommandPalette(root = document) {
  if (root == null) {
    throw new TypeError("enhanceCommandPalette: root must be a Document, Element, or ShadowRoot");
  }
  /** @type {Array<() => void>} */
  const cleanups = [];
  if (root instanceof Element && root.matches?.("[data-re-command-palette]")) {
    cleanups.push(wireOne(/** @type {HTMLDialogElement} */ (root)));
  }
  root.querySelectorAll("[data-re-command-palette]").forEach((d) => {
    cleanups.push(wireOne(/** @type {HTMLDialogElement} */ (d)));
  });
  return {
    destroy() {
      while (cleanups.length) cleanups.pop()?.();
    },
  };
}

/**
 * @param {HTMLDialogElement} dialog
 * @returns {() => void}
 */
function wireOne(dialog) {
  if (dialog.hasAttribute("data-re-command-palette-ready")) return () => {};
  const doc = dialog.ownerDocument;
  const win = doc.defaultView ?? window;
  const input = /** @type {HTMLInputElement | null} */ (
    dialog.querySelector(".re-command-palette__input")
  );
  const list = /** @type {HTMLElement | null} */ (
    dialog.querySelector(".re-command-palette__list")
  );
  if (!input || !list) return () => {};
  const empty = /** @type {HTMLElement | null} */ (
    dialog.querySelector(".re-command-palette__empty")
  );

  dialog.setAttribute("data-re-command-palette-ready", "");

  // ---- Apply ARIA (NOT in static markup, to avoid ARIA-without-behavior) ----
  // Capture authored state so destroy() is a faithful round-trip.
  const hadListId = list.id;
  const hadListLabel = list.getAttribute("aria-label");
  const listId = list.id || `re-cmdk-list-${++uid}`;
  list.id = listId;
  list.setAttribute("role", "listbox");
  if (!hadListLabel) list.setAttribute("aria-label", "Commands");
  input.setAttribute("role", "combobox");
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-controls", listId);
  input.setAttribute("aria-expanded", "true");

  // Behavior-owned, always-present polite status line. It announces the result
  // COUNT as the user filters (APG combobox) and the empty state. The visible
  // `.re-command-palette__empty` card is toggled `hidden`, so a live region that
  // only exists while empty is unreliable — mute its own role=status so it can't
  // double-speak, and let this always-rendered sr-only node be the single source.
  const status = doc.createElement("span");
  status.className = "re-sr-only";
  status.setAttribute("role", "status");
  list.before(status);
  const emptyHadLive = empty?.getAttribute("aria-live") ?? null;
  if (empty) empty.setAttribute("aria-live", "off");

  /** @type {Array<{ group: Element; inner: Element | null; label: Element | null; labelGenerated: boolean }>} */
  const groups = [];
  dialog.querySelectorAll(".re-command-palette__group").forEach((group, gi) => {
    const label = group.querySelector(".re-command-palette__group-label");
    let labelGenerated = false;
    if (label) {
      if (!label.id) {
        label.id = `${listId}-g${gi}`;
        labelGenerated = true;
      }
      group.setAttribute("role", "group");
      group.setAttribute("aria-labelledby", label.id);
    }
    const inner = group.querySelector("ul");
    if (inner) inner.setAttribute("role", "presentation");
    groups.push({ group, inner, label, labelGenerated });
  });

  /** @type {HTMLElement[]} */
  const allItems = Array.from(dialog.querySelectorAll(".re-command-palette__item"));
  /** @type {Set<HTMLElement>} */
  const generatedIds = new Set();
  allItems.forEach((li, i) => {
    if (!li.id) {
      li.id = `${listId}-o${i}`;
      generatedIds.add(li);
    }
    li.setAttribute("role", "option");
    li.setAttribute("aria-selected", "false");
    const action = /** @type {HTMLElement | null} */ (
      li.querySelector(".re-command-palette__action")
    );
    if (action) {
      // Neutralize any nested interactive control: a role=option must not
      // contain a focusable widget (AT reaches it even with tabindex=-1). Lift
      // the link target to data and drop href; commands are non-interactive
      // <span>s already. Activation is performed by this behavior.
      if (action instanceof HTMLAnchorElement && action.getAttribute("href")) {
        li.dataset.cmdHref = action.getAttribute("href") || "";
        action.removeAttribute("href");
      }
      if (action.dataset.command) li.dataset.cmdCommand = action.dataset.command;
    }
    const labelEl = li.querySelector(".re-command-palette__item-label");
    li.dataset.cmdText = (li.dataset.reCommandValue || labelEl?.textContent || li.textContent || "")
      .trim()
      .toLowerCase();
  });

  const visibleItems = () =>
    allItems.filter((li) => !li.hidden && li.getAttribute("aria-disabled") !== "true");

  /** @param {HTMLElement | null} li */
  const setActive = (li) => {
    for (const el of allItems) el.setAttribute("aria-selected", String(el === li));
    if (li) {
      input.setAttribute("aria-activedescendant", li.id);
      li.scrollIntoView({ block: "nearest" });
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  };
  const active = () => {
    const id = input.getAttribute("aria-activedescendant");
    return id ? (allItems.find((el) => el.id === id) ?? null) : null;
  };

  let wasEmpty = false;
  const filter = () => {
    const q = input.value.trim().toLowerCase();
    for (const li of allItems) li.hidden = !!q && !(li.dataset.cmdText || "").includes(q);
    // Hide a group whose options are all hidden.
    dialog.querySelectorAll(".re-command-palette__group").forEach((group) => {
      const anyVisible = Array.from(group.querySelectorAll(".re-command-palette__item")).some(
        (li) => !(/** @type {HTMLElement} */ (li).hidden),
      );
      /** @type {HTMLElement} */ (group).hidden = !anyVisible;
    });
    const vis = visibleItems();
    const isEmpty = vis.length === 0;
    if (empty) {
      empty.hidden = !isEmpty;
      // A role=status only announces when its text MUTATES — un-hiding static
      // text isn't announced. Rewrite the message on the transition to empty.
      if (isEmpty && !wasEmpty) {
        const desc = empty.querySelector(".re-empty-state__description");
        if (desc) desc.textContent = q ? `No results for “${input.value.trim()}”.` : "No results.";
      }
      wasEmpty = isEmpty;
    }
    input.setAttribute("aria-expanded", String(!isEmpty));
    setActive(vis[0] ?? null);
  };

  // Announce the result count / empty state. Called only on user input (not on
  // open/close/init filters), so the dialog doesn't announce a count the instant
  // it opens — only as the user actually narrows.
  const announceResults = () => {
    const n = visibleItems().length;
    const q = input.value.trim();
    status.textContent =
      n === 0 ? (q ? `No results for “${q}”.` : "No results.") : `${n} result${n === 1 ? "" : "s"}`;
  };

  /** @param {1 | -1} dir */
  const move = (dir) => {
    const vis = visibleItems();
    if (!vis.length) return;
    const idx = vis.indexOf(/** @type {HTMLElement} */ (active()));
    setActive(vis[(idx + dir + vis.length) % vis.length]);
  };

  /** @param {HTMLElement} li */
  const activate = (li) => {
    if (li.getAttribute("aria-disabled") === "true") return;
    const href = li.dataset.cmdHref || null;
    const command = li.dataset.cmdCommand || null;
    const allowed = dialog.dispatchEvent(
      new CustomEvent("re-command", {
        bubbles: true,
        cancelable: true,
        detail: { command, href, option: li },
      }),
    );
    // A consumer preventDefault()s to keep the palette open (cancelable
    // contract); only close + navigate when not cancelled.
    if (!allowed) return;
    dialog.close();
    if (href) win.location.assign(href);
  };

  const onInput = () => {
    filter();
    announceResults();
  };
  /** @param {KeyboardEvent} event */
  const onKeydown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "Home" || event.key === "End") {
      const vis = visibleItems();
      if (vis.length) {
        event.preventDefault();
        setActive(event.key === "Home" ? vis[0] : vis[vis.length - 1]);
      }
    } else if (event.key === "Enter") {
      const cur = active();
      if (cur) {
        event.preventDefault();
        activate(cur);
      }
    }
  };
  /** @param {MouseEvent} event */
  const onListClick = (event) => {
    const li = /** @type {Element | null} */ (event.target)?.closest(".re-command-palette__item");
    if (li && allItems.includes(/** @type {HTMLElement} */ (li))) {
      event.preventDefault();
      activate(/** @type {HTMLElement} */ (li));
    }
  };
  /** @param {Event} event */
  const onListPointerover = (event) => {
    const li = /** @type {HTMLElement | null} */ (
      /** @type {Element | null} */ (event.target)?.closest(".re-command-palette__item")
    );
    // Mirror the keyboard filter: never highlight a hidden or disabled option.
    if (li && !li.hidden && li.getAttribute("aria-disabled") !== "true") setActive(li);
  };
  const onClose = () => {
    input.value = "";
    filter();
  };

  // Native <dialog> has no "open" event; observe the attribute to focus + reset.
  const observer = new win.MutationObserver(() => {
    if (dialog.open) {
      input.focus();
      filter();
    }
  });
  observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });

  // ---- Optional global hotkey ----
  const hotkey = dialog.dataset.reCommandHotkey;
  /** @type {((e: KeyboardEvent) => void) | null} */
  let onHotkey = null;
  if (hotkey) {
    const parts = hotkey.toLowerCase().split("+");
    const key = parts[parts.length - 1];
    const wantMod = parts.includes("mod") || parts.includes("ctrl") || parts.includes("meta");
    const isMac = /mac/i.test(
      /** @type {{ userAgentData?: { platform?: string } }} */ (win.navigator).userAgentData
        ?.platform ||
        win.navigator.platform ||
        "",
    );
    onHotkey = (event) => {
      if (event.key.toLowerCase() !== key) return;
      if (wantMod) {
        const mod = isMac ? event.metaKey : event.ctrlKey;
        if (!mod) return;
      } else {
        // bare key: ignore while typing in a field
        const a = doc.activeElement;
        if (a && /^(input|textarea|select)$/i.test(a.tagName)) return;
        if (a instanceof HTMLElement && a.isContentEditable) return;
      }
      event.preventDefault();
      // Claim the combo: stop it bubbling to ancestor/window-level handlers so a
      // page-wide ⌘K search (e.g. the docs site's Pagefind, or any app search
      // bound on window) doesn't ALSO fire. We listen on `document`, which in the
      // bubble phase runs before any `window` listener, so this reliably wins.
      event.stopPropagation();
      if (!dialog.open) dialog.showModal();
    };
    doc.addEventListener("keydown", onHotkey);
  }

  input.addEventListener("input", onInput);
  input.addEventListener("keydown", /** @type {EventListener} */ (onKeydown));
  list.addEventListener("click", onListClick);
  list.addEventListener("pointerover", onListPointerover);
  dialog.addEventListener("close", onClose);
  filter();

  return () => {
    observer.disconnect();
    if (onHotkey) doc.removeEventListener("keydown", onHotkey);
    input.removeEventListener("input", onInput);
    input.removeEventListener("keydown", /** @type {EventListener} */ (onKeydown));
    list.removeEventListener("click", onListClick);
    list.removeEventListener("pointerover", onListPointerover);
    dialog.removeEventListener("close", onClose);
    // Restore each item to its authored shape (re-add href, drop the lifted
    // data + generated id + role + filter state).
    for (const li of allItems) {
      li.removeAttribute("role");
      li.removeAttribute("aria-selected");
      li.hidden = false;
      const action = li.querySelector(".re-command-palette__action");
      if (action && li.dataset.cmdHref) action.setAttribute("href", li.dataset.cmdHref);
      delete li.dataset.cmdHref;
      delete li.dataset.cmdCommand;
      delete li.dataset.cmdText;
      if (generatedIds.has(li)) li.removeAttribute("id");
    }
    // Restore the groups + inner lists.
    for (const g of groups) {
      g.group.removeAttribute("role");
      g.group.removeAttribute("aria-labelledby");
      /** @type {HTMLElement} */ (g.group).hidden = false;
      g.inner?.removeAttribute("role");
      if (g.labelGenerated) g.label?.removeAttribute("id");
    }
    // Restore the list.
    list.removeAttribute("role");
    if (!hadListLabel) list.removeAttribute("aria-label");
    if (hadListId) list.id = hadListId;
    else list.removeAttribute("id");
    input.removeAttribute("role");
    input.removeAttribute("aria-autocomplete");
    input.removeAttribute("aria-controls");
    input.removeAttribute("aria-expanded");
    input.removeAttribute("aria-activedescendant");
    status.remove();
    if (empty) {
      if (emptyHadLive == null) empty.removeAttribute("aria-live");
      else empty.setAttribute("aria-live", emptyHadLive);
    }
    dialog.removeAttribute("data-re-command-palette-ready");
  };
}
