import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.js",
    "behaviors/dismissible": "src/behaviors/dismissible.js",
    "behaviors/dialog": "src/behaviors/dialog.js",
    "behaviors/tabs": "src/behaviors/tabs.js",
    "behaviors/menu-button": "src/behaviors/menu-button.js",
    "behaviors/popover": "src/behaviors/popover.js",
    "behaviors/toast": "src/behaviors/toast.js",
    "behaviors/combobox": "src/behaviors/combobox.js",
    "behaviors/password-toggle": "src/behaviors/password-toggle.js",
    "behaviors/number-stepper": "src/behaviors/number-stepper.js",
    "behaviors/autosize": "src/behaviors/autosize.js",
    "behaviors/otp": "src/behaviors/otp.js",
    "behaviors/tags-input": "src/behaviors/tags-input.js",
    "behaviors/rating": "src/behaviors/rating.js",
    "elements/re-tabs": "src/elements/re-tabs.js",
    "elements/re-toast": "src/elements/re-toast.js",
    "elements/re-menu": "src/elements/re-menu.js",
    "elements/re-popover": "src/elements/re-popover.js",
  },
  format: ["esm"],
  dts: true,
  clean: false, // CSS build runs separately and writes to dist/ first
  outDir: "dist",
  sourcemap: false,
  treeshake: true,
});
