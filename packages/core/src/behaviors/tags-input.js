/**
 * enhanceTagsInput
 * ----------------
 * Turns a plain text input into a token/chip editor. Two markup modes:
 *
 *   • Input mode — `data-re-tags-input` on the `<input>` itself. The behavior
 *     builds a `.re-tags-input` group by MOVING the input into a wrapper it
 *     creates. Simplest markup; ideal for plain HTML / server-rendered pages.
 *
 *   • Container mode — `data-re-tags-input` on a CONTAINER that holds the input.
 *     The behavior adopts that container as the group and injects the chips as
 *     siblings of the input WITHOUT moving it. Use this in a vdom framework
 *     (React/Vue/Svelte/Angular): because the framework-rendered input is never
 *     reparented, a re-render that mutates the input's slot can't throw. The
 *     `<re-tags-input>` custom element is container mode, packaged.
 *
 *   <!-- input mode -->
 *   <input class="re-input" name="tags" data-re-tags-input value="design, eng" />
 *
 *   <!-- container mode (give the container an accessible name) -->
 *   <div class="re-field">
 *     <label class="re-field__label" for="t">Tags</label>
 *     <div data-re-tags-input>
 *       <input class="re-input" id="t" name="tags" value="design, eng" />
 *     </div>
 *   </div>
 *
 *   import { enhanceTagsInput } from "@relements/core/behaviors/tags-input";
 *   enhanceTagsInput(document);
 *
 * Options (data-* on the input): data-re-tags-max, data-re-tags-name (hidden-input
 * name; default = the input's name), data-re-tags-allow-duplicates,
 * data-re-tags-tone (a .re-tag data-tone). Dispatches a bubbling `re-tags-change`
 * ({ detail: { values } }) + `change` on the group on every commit/remove.
 * destroy() restores the plain input. Degrades to a usable comma-separated text
 * field with no JS.
 *
 * @typedef {{ destroy: () => void }} Controller
 */

let uid = 0;

/**
 * @param {Document | Element | ShadowRoot} [root=document]
 * @returns {Controller}
 */
export function enhanceTagsInput(root = document) {
  if (root == null) {
    throw new TypeError("enhanceTagsInput: root must be a Document, Element, or ShadowRoot");
  }

  /** @type {Array<() => void>} */
  const cleanups = [];
  const wire = (el) => cleanups.push(wireOne(/** @type {HTMLElement} */ (el)));

  // Match the marker on either an <input> (input mode) or a container (container
  // mode); wireOne branches on the element type.
  if (root instanceof Element && root.matches?.("[data-re-tags-input]")) wire(root);
  root.querySelectorAll("[data-re-tags-input]").forEach(wire);

  return {
    destroy() {
      while (cleanups.length) cleanups.pop()?.();
    },
  };
}

/**
 * @param {HTMLElement} el  The marked element: an `<input>` (input mode) or a
 *   container holding exactly one editor `<input>` (container mode).
 * @returns {() => void}
 */
function wireOne(el) {
  if (el.hasAttribute("data-re-tags-input-ready")) return () => {};

  const containerMode = !(el instanceof HTMLInputElement);
  const input = containerMode
    ? /** @type {HTMLInputElement | null} */ (el.querySelector("input:not([type=hidden])"))
    : /** @type {HTMLInputElement} */ (el);
  if (!input) return () => {};

  const doc = input.ownerDocument;
  const win = doc.defaultView ?? window;
  const id = `re-tags-${++uid}`;
  const tagsName = input.dataset.reTagsName || input.getAttribute("name") || "tags";
  const max = parseInt(input.dataset.reTagsMax || "", 10);
  const allowDupes = input.hasAttribute("data-re-tags-allow-duplicates");
  const tone = input.dataset.reTagsTone || "";

  // Stash original input state for destroy().
  const origName = input.getAttribute("name");
  const origValue = input.value;
  const origClass = input.className;
  const origAutocomplete = input.getAttribute("autocomplete");

  // Chips live in a display:contents list wrapper so AT announces "list, N items"
  // and can review each tag, while the chips stay flex children of the group.
  const chipList = doc.createElement("span");
  chipList.className = "re-tags-input__list";
  chipList.setAttribute("role", "list");

  // Polite live region for add/remove announcements.
  const live = doc.createElement("span");
  live.className = "re-sr-only";
  live.setAttribute("aria-live", "polite");

  // ---- Assemble the group, per mode ------------------------------------------
  /** @type {HTMLElement} */
  let group;
  let addedGroupClass = false;
  let addedGroupRole = false;
  if (containerMode) {
    // Adopt the author/element-owned container as the group. Inject chips BEFORE
    // and the live region AFTER the input — as siblings, NEVER moving the input,
    // so a framework that owns the container's children can't choke on a slot it
    // expects to hold the input.
    group = el;
    addedGroupClass = !group.classList.contains("re-tags-input");
    group.classList.add("re-tags-input");
    if (!group.hasAttribute("role")) {
      group.setAttribute("role", "group");
      addedGroupRole = true;
    }
    input.before(chipList);
    input.after(live);
    input.classList.add("re-tags-input__field");
  } else {
    // Build a fresh wrapper and MOVE the input into it (input mode).
    group = doc.createElement("div");
    group.className = "re-tags-input";
    group.setAttribute("role", "group");
    input.before(group);
    group.append(input);
    group.prepend(chipList); // chips render before the editor
    group.append(live);
    input.className = "re-tags-input__field";
  }

  // Label the group from the field's <label for> — unless the group already has
  // a name (container mode lets the author/element supply aria-label/labelledby).
  const label = /** @type {HTMLElement | null} */ (
    input.id ? input.closest(".re-field")?.querySelector(`label[for="${input.id}"]`) : null
  );
  let injectedLabelId = false;
  let addedLabelledby = false;
  if (label && !group.hasAttribute("aria-labelledby") && !group.hasAttribute("aria-label")) {
    if (!label.id) {
      label.id = `${id}-label`;
      injectedLabelId = true;
    }
    group.setAttribute("aria-labelledby", label.id);
    addedLabelledby = true;
  }

  // Associate the editor with the field hint (e.g. "Press Enter to add").
  const hint = /** @type {HTMLElement | null} */ (
    input.closest(".re-field")?.querySelector(".re-field__hint") ?? null
  );
  let injectedHintId = false;
  let injectedDescribedBy = false;
  if (hint && !input.getAttribute("aria-describedby")) {
    if (!hint.id) {
      hint.id = `${id}-hint`;
      injectedHintId = true;
    }
    input.setAttribute("aria-describedby", hint.id);
    injectedDescribedBy = true;
  }

  input.removeAttribute("name"); // the hidden chip inputs carry the submitted name
  input.setAttribute("autocomplete", "off");
  el.setAttribute("data-re-tags-input-ready", "");

  // ---- Shared core -----------------------------------------------------------
  /** @returns {string[]} current tag values, in order. */
  const values = () =>
    Array.from(group.querySelectorAll("input[type=hidden]")).map(
      (h) => /** @type {HTMLInputElement} */ (h).value,
    );

  let muted = true; // suppress announcements while seeding the initial chips
  let announceRaf = 0;
  /** @param {string} msg */
  const announce = (msg) => {
    if (muted) return;
    // Clear then set on the next frame so an identical consecutive message still
    // mutates the text node and re-announces (a polite region is silent on no-op).
    live.textContent = "";
    win.cancelAnimationFrame(announceRaf);
    announceRaf = win.requestAnimationFrame(() => (live.textContent = msg));
  };

  const fireChange = () => {
    group.dispatchEvent(
      new CustomEvent("re-tags-change", { bubbles: true, detail: { values: values() } }),
    );
    group.dispatchEvent(new Event("change", { bubbles: true }));
  };

  /** @param {string} value @returns {boolean} added? */
  const addTag = (value) => {
    const tag = value.trim();
    if (!tag) return false;
    if (!allowDupes && values().some((v) => v.toLowerCase() === tag.toLowerCase())) {
      announce(`${tag} is already added`);
      return false;
    }
    if (Number.isFinite(max) && values().length >= max) {
      group.setAttribute("data-invalid", "");
      announce(`Maximum ${max} tags reached`);
      return false;
    }
    const chip = doc.createElement("span");
    chip.className = "re-tag";
    if (tone) chip.dataset.tone = tone;
    chip.dataset.reTagsChip = "";
    chip.setAttribute("role", "listitem");
    const text = doc.createElement("span");
    text.textContent = tag;
    const remove = doc.createElement("button");
    remove.type = "button";
    remove.className = "re-tag__remove";
    // A tags-specific hook (NOT data-re-dismiss) so chip removal can't be hijacked
    // by a global enhanceDismissible listener on the same document.
    remove.setAttribute("data-re-tags-remove", "");
    remove.setAttribute("aria-label", `Remove ${tag}`);
    remove.textContent = "×";
    chip.append(text, remove);
    const hidden = doc.createElement("input");
    hidden.type = "hidden";
    hidden.name = tagsName;
    hidden.value = tag;
    chip.append(hidden);
    chipList.append(chip); // the list wrapper renders before the editor input
    if (!Number.isFinite(max) || values().length <= max) group.removeAttribute("data-invalid");
    announce(`Added ${tag}`);
    return true;
  };

  /** @param {HTMLElement} chip @param {boolean} moveFocus */
  const removeChip = (chip, moveFocus) => {
    const tag = chip.querySelector("input[type=hidden]");
    const name = tag ? /** @type {HTMLInputElement} */ (tag).value : "";
    const prev = chip.previousElementSibling;
    chip.remove();
    group.removeAttribute("data-invalid");
    announce(`Removed ${name}`);
    if (moveFocus) {
      const prevRemove =
        prev && prev.matches?.("[data-re-tags-chip]")
          ? /** @type {HTMLElement} */ (prev.querySelector(".re-tag__remove"))
          : null;
      (prevRemove || input).focus();
    }
    fireChange();
  };

  // Seed chips from the original comma-separated value.
  origValue
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach(addTag);
  input.value = "";
  muted = false; // seeded chips are placed — announce real edits from here

  /** @param {KeyboardEvent} event */
  const onKeydown = (event) => {
    if (event.key === "Enter") {
      if (input.value.trim()) {
        event.preventDefault();
        if (addTag(input.value)) {
          input.value = "";
          fireChange();
        }
      }
    } else if (event.key === "Backspace" && input.value === "") {
      const chips = group.querySelectorAll("[data-re-tags-chip]");
      const last = chips[chips.length - 1];
      if (last) {
        event.preventDefault();
        removeChip(/** @type {HTMLElement} */ (last), false);
      }
    }
  };

  // Commit on a typed/pasted delimiter (comma): split, commit complete tokens.
  const onInput = () => {
    if (!input.value.includes(",")) return;
    const parts = input.value.split(",");
    const remainder = parts.pop() ?? "";
    let added = false;
    for (const p of parts) added = addTag(p) || added;
    // Leading whitespace after a delimiter isn't part of the next token.
    input.value = remainder.replace(/^\s+/, "");
    if (added) fireChange();
  };

  /** @param {Event} event */
  const onClick = (event) => {
    const btn = /** @type {Element | null} */ (event.target)?.closest("[data-re-tags-remove]");
    if (!btn) return;
    const chip = btn.closest("[data-re-tags-chip]");
    if (chip) removeChip(/** @type {HTMLElement} */ (chip), true);
  };

  // Clicking the group (padding) focuses the editor.
  const onGroupClick = (event) => {
    if (event.target === group) input.focus();
  };

  input.addEventListener("keydown", onKeydown);
  input.addEventListener("input", onInput);
  group.addEventListener("click", onClick);
  group.addEventListener("mousedown", onGroupClick);

  return () => {
    input.removeEventListener("keydown", onKeydown);
    input.removeEventListener("input", onInput);
    group.removeEventListener("click", onClick);
    group.removeEventListener("mousedown", onGroupClick);
    win.cancelAnimationFrame(announceRaf);

    // Restore the input's submitted state (read values() before the chips go).
    if (origName !== null) input.setAttribute("name", origName);
    else input.removeAttribute("name");
    if (origAutocomplete !== null) input.setAttribute("autocomplete", origAutocomplete);
    else input.removeAttribute("autocomplete");
    if (injectedDescribedBy) input.removeAttribute("aria-describedby");
    input.value = values().length ? values().join(", ") : origValue;
    el.removeAttribute("data-re-tags-input-ready");

    if (containerMode) {
      // The container is author/element-owned: strip only what we injected.
      chipList.remove();
      live.remove();
      input.classList.remove("re-tags-input__field");
      group.removeAttribute("data-invalid");
      if (addedLabelledby) group.removeAttribute("aria-labelledby");
      if (addedGroupRole) group.removeAttribute("role");
      if (addedGroupClass) group.classList.remove("re-tags-input");
    } else {
      // Un-move the input and drop the wrapper we created.
      input.className = origClass;
      group.before(input);
      group.remove();
    }
    if (injectedLabelId && label) label.removeAttribute("id");
    if (injectedHintId && hint) hint.removeAttribute("id");
  };
}
