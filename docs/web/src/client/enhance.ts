import {
  enhanceDismissible,
  enhanceDialog,
  enhanceTabs,
  enhanceMenuButton,
  enhancePopover,
  showToast,
} from "@relements/core";

// Side-effect imports: each module calls customElements.define() on load.
import "@relements/core/elements/re-tabs";
import "@relements/core/elements/re-toast";
import "@relements/core/elements/re-menu";
import "@relements/core/elements/re-popover";

function init() {
  enhanceDismissible(document);
  enhanceDialog(document);
  enhanceTabs(document);
  enhanceMenuButton(document);
  enhancePopover(document);

  // `indeterminate` is a JS-only property, not an HTML attribute. Reflect it
  // for any demo checkbox that opts in with `data-demo-indeterminate`.
  for (const el of document.querySelectorAll<HTMLInputElement>("[data-demo-indeterminate]")) {
    el.indeterminate = true;
  }

  // showToast is imperative (no declarative markup form). For the docs demos,
  // wire buttons that carry `data-demo-toast` to fire a real toast. This is a
  // docs-site affordance, not a `@relements/core` API — the page also shows the
  // real `showToast(...)` call.
  document.addEventListener("click", (event) => {
    const trigger = (event.target as Element | null)?.closest<HTMLElement>("[data-demo-toast]");
    if (!trigger) return;
    const tone = trigger.dataset.demoToastTone as
      | "default"
      | "success"
      | "warning"
      | "danger"
      | undefined;
    showToast(trigger.dataset.demoToast ?? "", { tone });
  });
}

if (document.readyState !== "loading") {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}
