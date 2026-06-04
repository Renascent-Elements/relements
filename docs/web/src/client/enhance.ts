import {
  enhanceDismissible,
  enhanceDialog,
  enhanceTabs,
  enhanceMenuButton,
  enhancePopover,
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
}

if (document.readyState !== "loading") {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}
