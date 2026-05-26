/**
 * @relements/core entry point.
 *
 * Behaviors are tree-shakable named exports. CSS is imported separately
 * via the package's exports map (e.g. `@relements/core/index.css`).
 */

export { enhanceDismissible } from "./behaviors/dismissible.js";
export { enhanceDialog } from "./behaviors/dialog.js";
