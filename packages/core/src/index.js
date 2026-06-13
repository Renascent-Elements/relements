/**
 * @relements/core entry point.
 *
 * Behaviors are tree-shakable named exports. CSS is imported separately
 * via the package's exports map (e.g. `@relements/core/index.css`).
 */

export { enhanceDismissible } from "./behaviors/dismissible.js";
export { enhanceDialog } from "./behaviors/dialog.js";
export { enhanceTabs } from "./behaviors/tabs.js";
export { enhanceMenuButton } from "./behaviors/menu-button.js";
export { enhancePopover } from "./behaviors/popover.js";
export { showToast } from "./behaviors/toast.js";
export { enhanceCombobox } from "./behaviors/combobox.js";
export { enhancePasswordToggle } from "./behaviors/password-toggle.js";
export { enhanceNumberStepper } from "./behaviors/number-stepper.js";
export { enhanceAutosize } from "./behaviors/autosize.js";
export { enhanceOtp } from "./behaviors/otp.js";
export { enhanceTagsInput } from "./behaviors/tags-input.js";
export { enhanceRating } from "./behaviors/rating.js";
export { enhanceToolbar } from "./behaviors/toolbar.js";
