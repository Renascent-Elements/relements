import {
  enhanceDismissible,
  enhanceDialog,
  enhanceTabs,
  enhanceMenuButton,
  enhancePopover,
  enhanceCombobox,
  enhancePasswordToggle,
  enhanceNumberStepper,
  enhanceAutosize,
  enhanceOtp,
  enhanceTagsInput,
  enhanceRating,
  enhanceToolbar,
  enhanceRange,
  enhanceContextMenu,
  enhanceCommandPalette,
  enhanceFilePicker,
  enhanceCarousel,
  enhanceMultiSelect,
  showToast,
} from "@relements/core";

// Side-effect imports: each module calls customElements.define() on load.
import "@relements/core/elements/re-tabs";
import "@relements/core/elements/re-toast";
import "@relements/core/elements/re-menu";
import "@relements/core/elements/re-popover";
import "@relements/core/elements/re-file-picker";
import "@relements/core/elements/re-tags-input";

// The custom elements (`re-menu`, `re-popover`, `re-tabs`) enhance their own
// light-DOM subtree in connectedCallback. Running the global enhancers over the
// whole document would wire those same hosts a second time — harmless for tabs,
// but it double-binds the menu/popover toggle handlers so they open-then-close.
// So enhance only hosts that are NOT a self-enhancing custom element.
const SELF_ENHANCING = "re-menu, re-popover, re-tabs, re-file-picker, re-tags-input";

function enhanceScoped(selector: string, enhance: (root: Element) => unknown) {
  for (const host of document.querySelectorAll(selector)) {
    if (!host.closest(SELF_ENHANCING)) enhance(host);
  }
}

function init() {
  enhanceDismissible(document);
  enhanceDialog(document);
  enhanceScoped("[data-re-tabs]", enhanceTabs);
  enhanceScoped("[data-re-menu]", enhanceMenuButton);
  enhanceScoped("[data-re-popover]", enhancePopover);
  enhanceCombobox(document);
  enhancePasswordToggle(document);
  enhanceNumberStepper(document);
  enhanceAutosize(document);
  enhanceOtp(document);
  enhanceScoped("[data-re-tags-input]", enhanceTagsInput);
  enhanceRating(document);
  // Toolbar roving-tabindex. Its item filter excludes controls inside a nested
  // [role=menu] panel, so it composes with the enhanceMenuButton pass above and
  // doesn't rove into a hosted menu's items.
  enhanceScoped("[data-re-toolbar]", enhanceToolbar);
  enhanceRange(document);
  enhanceScoped("[data-re-context-menu]", enhanceContextMenu);
  enhanceCommandPalette(document);
  enhanceScoped("[data-re-file-picker]", enhanceFilePicker);
  enhanceCarousel(document);
  enhanceMultiSelect(document);

  // `indeterminate` is a JS-only property, not an HTML attribute. Reflect it
  // for any demo checkbox that opts in with `data-demo-indeterminate`.
  for (const el of document.querySelectorAll<HTMLInputElement>("[data-demo-indeterminate]")) {
    el.indeterminate = true;
  }

  // showToast is imperative (no declarative markup form). For the docs demos,
  // wire buttons that carry `data-demo-toast` to fire a real toast. This is a
  // docs-site affordance, not a `@relements/core` API — the page also shows the
  // real `showToast(...)` / `<re-toast>.show(...)` call. With `data-demo-toast-
  // target`, call that element's `.show()` (used on the <re-toast> page).
  document.addEventListener("click", (event) => {
    const trigger = (event.target as Element | null)?.closest<HTMLElement>("[data-demo-toast]");
    if (!trigger) return;
    const tone = trigger.dataset.demoToastTone as
      | "default"
      | "success"
      | "warning"
      | "danger"
      | undefined;
    const message = trigger.dataset.demoToast ?? "";
    const targetId = trigger.dataset.demoToastTarget;
    const target = targetId ? document.getElementById(targetId) : null;
    if (target && "show" in target && typeof target.show === "function") {
      (target.show as (m: string, o?: { tone?: typeof tone }) => unknown)(message, { tone });
    } else {
      showToast(message, { tone });
    }
  });
}

if (document.readyState !== "loading") {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}
