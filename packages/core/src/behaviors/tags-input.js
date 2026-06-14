/**
 * enhanceTagsInput
 * ----------------
 * Turns a plain text input into a token/chip editor. Base (no JS): a normal
 * `<input class="re-input" name="tags">` that submits one comma-separated value.
 * Enhanced: typing + Enter/comma commits chips (reusing .re-tag visuals), each
 * backed by a hidden <input> so the form submits an ARRAY (getAll(name)).
 * Backspace on an empty editor removes the last chip; × removes a chip.
 *
 *   <div class="re-field">
 *     <label class="re-field__label" for="t">Tags</label>
 *     <input class="re-input" id="t" name="tags" data-re-tags-input
 *            value="design, eng" placeholder="Add tags…" autocomplete="off" />
 *   </div>
 *   import { enhanceTagsInput } from "@relements/core/behaviors/tags-input";
 *   enhanceTagsInput(document);
 *
 * Options (data-*): data-re-tags-max, data-re-tags-name (hidden-input name;
 * default = the input's name), data-re-tags-allow-duplicates,
 * data-re-tags-tone (a .re-tag data-tone). Dispatches a bubbling
 * `re-tags-change` ({ detail: { values } }) + `change` on the group on every
 * commit/remove. destroy() restores the plain input. Degrades to a usable
 * comma-separated text field with no JS.
 */

/** @typedef {{ destroy: () => void }} Controller */

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

  if (root instanceof Element && root.matches?.("input[data-re-tags-input]")) {
    cleanups.push(wireOne(/** @type {HTMLInputElement} */ (root)));
  }
  root.querySelectorAll("input[data-re-tags-input]").forEach((input) => {
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
  if (input.hasAttribute("data-re-tags-input-ready")) return () => {};
  input.setAttribute("data-re-tags-input-ready", "");

  const doc = input.ownerDocument;
  const id = `re-tags-${++uid}`;
  const tagsName = input.dataset.reTagsName || input.getAttribute("name") || "tags";
  const max = parseInt(input.dataset.reTagsMax || "", 10);
  const allowDupes = input.hasAttribute("data-re-tags-allow-duplicates");
  const tone = input.dataset.reTagsTone || "";

  // Stash original state for destroy().
  const origName = input.getAttribute("name");
  const origValue = input.value;
  const origClass = input.className;
  const origAutocomplete = input.getAttribute("autocomplete");

  // Build the group wrapper around the editor input.
  const group = doc.createElement("div");
  group.className = "re-tags-input";
  group.setAttribute("role", "group");

  // Label the group from the field's label (explicit <label for> pattern).
  const label = /** @type {HTMLElement | null} */ (
    input.id ? input.closest(".re-field")?.querySelector(`label[for="${input.id}"]`) : null
  );
  let injectedLabelId = false;
  if (label) {
    if (!label.id) {
      label.id = `${id}-label`;
      injectedLabelId = true;
    }
    group.setAttribute("aria-labelledby", label.id);
  }

  input.before(group);
  group.append(input);
  input.removeAttribute("name");
  input.className = "re-tags-input__field";
  input.setAttribute("autocomplete", "off");

  // Polite live region for add/remove announcements.
  const live = doc.createElement("span");
  live.className = "re-sr-only";
  live.setAttribute("aria-live", "polite");
  group.append(live);

  /** @returns {string[]} current tag values, in order. */
  const values = () =>
    Array.from(group.querySelectorAll("input[type=hidden]")).map(
      (h) => /** @type {HTMLInputElement} */ (h).value,
    );

  /** @param {string} msg */
  const announce = (msg) => {
    live.textContent = msg;
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
    if (!allowDupes && values().some((v) => v.toLowerCase() === tag.toLowerCase())) return false;
    if (Number.isFinite(max) && values().length >= max) {
      group.setAttribute("data-invalid", "");
      announce(`Maximum ${max} tags reached`);
      return false;
    }
    const chip = doc.createElement("span");
    chip.className = "re-tag";
    if (tone) chip.dataset.tone = tone;
    chip.dataset.reTagsChip = "";
    const text = doc.createElement("span");
    text.textContent = tag;
    const remove = doc.createElement("button");
    remove.type = "button";
    remove.className = "re-tag__remove";
    // A tags-specific hook (NOT data-re-dismiss) so chip removal can't be
    // hijacked by a global enhanceDismissible listener on the same document.
    remove.setAttribute("data-re-tags-remove", "");
    remove.setAttribute("aria-label", `Remove ${tag}`);
    remove.textContent = "×";
    chip.append(text, remove);
    const hidden = doc.createElement("input");
    hidden.type = "hidden";
    hidden.name = tagsName;
    hidden.value = tag;
    chip.append(hidden);
    // Insert chips before the editor input so the editor stays last.
    group.insertBefore(chip, input);
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
  live.textContent = ""; // don't announce the seeded tags on enhance

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
    // Restore the plain input (with the current tokens) in place of the group.
    input.className = origClass;
    if (origName !== null) input.setAttribute("name", origName);
    if (origAutocomplete !== null) input.setAttribute("autocomplete", origAutocomplete);
    else input.removeAttribute("autocomplete");
    input.value = values().length ? values().join(", ") : origValue;
    input.removeAttribute("data-re-tags-input-ready");
    group.before(input);
    group.remove();
    if (injectedLabelId && label) label.removeAttribute("id");
  };
}
