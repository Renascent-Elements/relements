/**
 * enhanceFilePicker
 * -----------------
 * Adds the optional JS layer over a `.re-file-picker` (route B) — the native
 * `<input type="file">` is never proxied, so it stays the form value:
 *
 *   - echoes the selected filenames into `__list` (visible) and announces a
 *     summary through the sr-only `role="status"` `__status` region,
 *   - shows the `__clear` button and a `data-has-files` marker while a selection
 *     exists; Clear resets the input,
 *   - wires drag-and-drop on the host (drop REPLACES the selection, honoring
 *     `multiple`, `accept`, and the optional `data-re-file-max-size` /
 *     `data-re-file-max-files` limits),
 *   - on a rejected selection sets `aria-invalid` and emits `re-error`.
 *
 * It dispatches the native `change` event after a drop/clear (so frameworks and
 * forms observe it exactly like a manual pick) and does NOT add a custom
 * "changed" event — `change` already carries `event.target.files`. The only
 * custom event is `re-error`.
 *
 *   <div class="re-file-picker" data-re-file-picker
 *        data-re-file-max-size="5000000" data-re-file-max-files="3">
 *     <label class="re-file-picker__field">
 *       <input type="file" class="re-file-picker__input" name="docs" multiple />
 *       …__ui…
 *     </label>
 *     <p class="re-file-picker__list" hidden></p>
 *     <button class="re-file-picker__clear" data-re-file-clear hidden …>Clear</button>
 *     <span class="re-file-picker__status re-sr-only" role="status" aria-live="polite"></span>
 *   </div>
 *
 * Without this behavior the picker is still a working native file control (the
 * filename just isn't echoed).
 *
 * @typedef {{ destroy: () => void }} Controller
 * @typedef {{ reason: "too-many" | "too-large" | "wrong-type",
 *             rejected: File[], accepted: File[] }} FileRejection
 */

/**
 * @param {Document | Element | ShadowRoot} [root=document]
 * @returns {Controller}
 */
export function enhanceFilePicker(root = document) {
  if (root == null) {
    throw new TypeError("enhanceFilePicker: root must be a Document, Element, or ShadowRoot");
  }
  /** @type {Array<() => void>} */
  const cleanups = [];
  const wire = (host) => cleanups.push(wireOne(/** @type {HTMLElement} */ (host)));

  if (root instanceof Element && root.matches?.("[data-re-file-picker]")) wire(root);
  root.querySelectorAll("[data-re-file-picker]").forEach(wire);

  return {
    destroy() {
      while (cleanups.length) cleanups.pop()?.();
    },
  };
}

/**
 * @param {HTMLElement} host
 * @returns {() => void}
 */
function wireOne(host) {
  const input = /** @type {HTMLInputElement | null} */ (
    host.querySelector(".re-file-picker__input")
  );
  if (!input || input.type !== "file") return () => {};
  if (host.hasAttribute("data-re-file-picker-ready")) return () => {}; // idempotent
  host.setAttribute("data-re-file-picker-ready", "");

  const list = host.querySelector(".re-file-picker__list");
  const status = host.querySelector(".re-file-picker__status");
  const clearBtn = /** @type {HTMLButtonElement | null} */ (
    host.querySelector("[data-re-file-clear]")
  );

  const maxFiles = intAttr(host, "data-re-file-max-files");
  const maxSize = intAttr(host, "data-re-file-max-size");

  /** Reflect the current `input.files` into the visible UI. */
  const render = () => {
    const files = Array.from(input.files ?? []);
    const has = files.length > 0;
    host.toggleAttribute("data-has-files", has);
    if (clearBtn) clearBtn.hidden = !has;
    if (list) {
      list.hidden = !has;
      list.textContent = summarize(files);
    }
  };

  /** Announce the selection through the sr-only status region (on change only,
      never on initial render, so the page doesn't falsely say "cleared"). */
  const announce = () => {
    if (!status) return;
    const files = Array.from(input.files ?? []);
    status.textContent = files.length ? `${summarize(files)} selected` : "Selection cleared";
  };

  /** Validate a candidate set against multiple/accept/max-* and apply it. */
  const accept = (candidates) => {
    let files = candidates;
    if (!input.multiple) files = files.slice(0, 1);

    const okType = (f) => fileMatchesAccept(f, input.accept);
    const wrongType = files.filter((f) => !okType(f));
    files = files.filter(okType);

    const tooLarge = maxSize != null ? files.filter((f) => f.size > maxSize) : [];
    if (maxSize != null) files = files.filter((f) => f.size <= maxSize);

    let reason = null;
    if (wrongType.length) reason = "wrong-type";
    else if (tooLarge.length) reason = "too-large";
    else if (maxFiles != null && files.length > maxFiles) {
      reason = "too-many";
      files = files.slice(0, maxFiles);
    }

    if (files.length) {
      const dt = new DataTransfer();
      files.forEach((f) => dt.items.add(f));
      input.files = dt.files;
    }
    input.dispatchEvent(new Event("change", { bubbles: true }));

    if (reason) {
      input.setAttribute("aria-invalid", "true");
      host.dispatchEvent(
        new CustomEvent("re-error", {
          bubbles: true,
          detail: { reason, rejected: [...wrongType, ...tooLarge], accepted: files },
        }),
      );
    } else {
      input.removeAttribute("aria-invalid");
    }
  };

  // --- listeners ---------------------------------------------------------
  const onChange = () => {
    render();
    announce();
  };
  input.addEventListener("change", onChange);

  const onClear = () => {
    if (input.disabled) return;
    input.value = "";
    input.removeAttribute("aria-invalid");
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };
  clearBtn?.addEventListener("click", onClear);

  const stop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onDragOver = (e) => {
    if (input.disabled) return;
    stop(e);
    host.setAttribute("data-dragover", "");
  };
  const onDragLeave = (e) => {
    if (e.target === host || !host.contains(e.relatedTarget)) host.removeAttribute("data-dragover");
  };
  const onDrop = (e) => {
    host.removeAttribute("data-dragover");
    if (input.disabled) return;
    stop(e);
    const dropped = Array.from(e.dataTransfer?.files ?? []);
    if (dropped.length) accept(dropped);
  };
  host.addEventListener("dragover", onDragOver);
  host.addEventListener("dragleave", onDragLeave);
  host.addEventListener("drop", onDrop);

  // A native form reset clears input.files without firing change on the input.
  const form = input.form;
  const onReset = () => queueMicrotask(render);
  form?.addEventListener("reset", onReset);

  render();

  return () => {
    input.removeEventListener("change", onChange);
    clearBtn?.removeEventListener("click", onClear);
    host.removeEventListener("dragover", onDragOver);
    host.removeEventListener("dragleave", onDragLeave);
    host.removeEventListener("drop", onDrop);
    form?.removeEventListener("reset", onReset);
    host.removeAttribute("data-re-file-picker-ready");
    host.removeAttribute("data-has-files");
    host.removeAttribute("data-dragover");
    // Preserve the user's selection (input.files); just restore the authored UI.
    if (clearBtn) clearBtn.hidden = true;
    if (list) {
      list.hidden = true;
      list.textContent = "";
    }
    if (status) status.textContent = "";
  };
}

/** @param {File[]} files */
function summarize(files) {
  if (files.length === 0) return "";
  if (files.length === 1) return files[0].name;
  return `${files.length} files`;
}

/**
 * Does a file match an `accept` list (MIME `image/png`, wildcard `image/*`, or
 * extension `.png`)? Empty accept matches everything.
 * @param {File} file
 * @param {string} accept
 */
function fileMatchesAccept(file, accept) {
  const tokens = (accept ?? "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (!tokens.length) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return tokens.some((tok) => {
    if (tok.startsWith(".")) return name.endsWith(tok);
    if (tok.endsWith("/*")) return type.startsWith(tok.slice(0, -1));
    return type === tok;
  });
}

/**
 * @param {HTMLElement} el
 * @param {string} attr
 * @returns {number | null}
 */
function intAttr(el, attr) {
  if (!el.hasAttribute(attr)) return null;
  const n = parseInt(el.getAttribute(attr) ?? "", 10);
  return Number.isFinite(n) ? n : null;
}
