/**
 * enhanceTabs
 * -----------
 * Wires the ARIA tabs pattern over server-rendered markup.
 *
 *   <div class="re-tabs" data-re-tabs>
 *     <div role="tablist" aria-label="Settings">
 *       <button role="tab" id="t-1" aria-controls="p-1" aria-selected="true">…</button>
 *       <button role="tab" id="t-2" aria-controls="p-2" aria-selected="false" tabindex="-1">…</button>
 *     </div>
 *     <section role="tabpanel" id="p-1" aria-labelledby="t-1">…</section>
 *     <section role="tabpanel" id="p-2" aria-labelledby="t-2" hidden>…</section>
 *   </div>
 *
 * Keyboard:
 *   ArrowLeft / ArrowRight — move focus AND activate (automatic activation)
 *   Home / End             — jump to first / last (and activate)
 *   Enter / Space          — activate the focused tab
 *
 * Dispatches `re-change` (bubbles, cancelable) on the host `[data-re-tabs]`
 * with `detail = { tabId, panelId }` whenever the selected tab changes.
 *
 *   import { enhanceTabs } from "@relements/core/behaviors/tabs";
 *   const c = enhanceTabs(document);
 *   c.destroy();
 */

/** @typedef {{ destroy: () => void }} Controller */

/**
 * @param {Document | Element | ShadowRoot} [root=document]
 * @returns {Controller}
 */
export function enhanceTabs(root = document) {
  if (root == null) {
    throw new TypeError("enhanceTabs: root must be a Document, Element, or ShadowRoot");
  }

  /** @type {Array<{ host: Element; cleanup: () => void }>} */
  const hosts = [];

  // Include the root itself when it carries the marker (e.g. a custom element host).
  if (root instanceof Element && /** @type {Element} */ (root).matches?.("[data-re-tabs]")) {
    const cleanup = wireOne(/** @type {HTMLElement} */ (root));
    hosts.push({ host: root, cleanup });
  }

  /** @type {NodeListOf<Element>} */
  const tabsList = root.querySelectorAll("[data-re-tabs]");
  tabsList.forEach((host) => {
    const cleanup = wireOne(/** @type {HTMLElement} */ (host));
    hosts.push({ host, cleanup });
  });

  return {
    destroy() {
      while (hosts.length) {
        const entry = hosts.pop();
        entry?.cleanup();
      }
    },
  };
}

/**
 * @param {HTMLElement} host
 * @returns {() => void}
 */
function wireOne(host) {
  const tablist = host.querySelector('[role="tablist"]');
  if (!tablist) return () => {};
  /** @type {HTMLElement[]} */
  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  if (tabs.length === 0) return () => {};

  // Ensure roving tabindex matches aria-selected.
  const syncRoving = () => {
    for (const t of tabs) {
      t.tabIndex = t.getAttribute("aria-selected") === "true" ? 0 : -1;
    }
  };
  syncRoving();

  /**
   * @param {HTMLElement} tab
   * @param {{ focus?: boolean }} [opts]
   */
  const select = (tab, opts = {}) => {
    if (tab.getAttribute("aria-selected") === "true") {
      if (opts.focus) tab.focus();
      return;
    }
    const panelId = tab.getAttribute("aria-controls");
    const cancelled = !host.dispatchEvent(
      new CustomEvent("re-change", {
        bubbles: true,
        cancelable: true,
        detail: { tabId: tab.id, panelId },
      }),
    );
    if (cancelled) return;

    for (const t of tabs) {
      const isMe = t === tab;
      t.setAttribute("aria-selected", isMe ? "true" : "false");
      t.tabIndex = isMe ? 0 : -1;
      const pid = t.getAttribute("aria-controls");
      if (pid) {
        const panel = host.querySelector(`#${cssEscape(pid)}`);
        if (panel) /** @type {HTMLElement} */ (panel).hidden = !isMe;
      }
    }
    if (opts.focus) tab.focus();
  };

  /** @param {Event} event */
  const onClick = (event) => {
    const t = /** @type {Element | null} */ (event.target);
    const tab = t?.closest('[role="tab"]');
    if (tab && tabs.includes(/** @type {HTMLElement} */ (tab))) {
      select(/** @type {HTMLElement} */ (tab), { focus: true });
    }
  };

  /** @param {KeyboardEvent} event */
  const onKey = (event) => {
    const current = document.activeElement;
    if (!current || !tabs.includes(/** @type {HTMLElement} */ (current))) return;
    const idx = tabs.indexOf(/** @type {HTMLElement} */ (current));
    if (idx === -1) return;
    let nextIdx = idx;
    switch (event.key) {
      case "ArrowRight":
        nextIdx = (idx + 1) % tabs.length;
        break;
      case "ArrowLeft":
        nextIdx = (idx - 1 + tabs.length) % tabs.length;
        break;
      case "Home":
        nextIdx = 0;
        break;
      case "End":
        nextIdx = tabs.length - 1;
        break;
      case "Enter":
      case " ":
      case "Spacebar":
        event.preventDefault();
        select(/** @type {HTMLElement} */ (current), { focus: true });
        return;
      default:
        return;
    }
    event.preventDefault();
    tabs[nextIdx].focus();
    select(tabs[nextIdx]);
  };

  tablist.addEventListener("click", onClick);
  tablist.addEventListener("keydown", /** @type {EventListener} */ (onKey));

  return () => {
    tablist.removeEventListener("click", onClick);
    tablist.removeEventListener("keydown", /** @type {EventListener} */ (onKey));
  };
}

/** @param {string} value */
function cssEscape(value) {
  return typeof CSS !== "undefined" && CSS.escape ? CSS.escape(value) : value;
}
