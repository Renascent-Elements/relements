import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import pkg from "../../packages/core/package.json" with { type: "json" };

const distRoot = join(import.meta.dirname, "../../packages/core/dist");

describe("@relements/core package", () => {
  it("has the expected name", () => {
    expect(pkg.name).toBe("@relements/core");
  });

  it("declares CSS side effects", () => {
    expect(pkg.sideEffects).toContain("**/*.css");
  });

  it("exposes the root entry", () => {
    expect((pkg.exports as Record<string, unknown>)["."]).toBeTruthy();
  });
});

describe("@relements/core dist", () => {
  it("dist/index.css exists", () => {
    expect(existsSync(join(distRoot, "index.css"))).toBe(true);
  });

  it("dist/index.js exists", () => {
    expect(existsSync(join(distRoot, "index.js"))).toBe(true);
  });

  it("dist/index.d.ts exists", () => {
    expect(existsSync(join(distRoot, "index.d.ts"))).toBe(true);
  });

  it("per-component CSS files exist", () => {
    const components = [
      "button.css",
      "link.css",
      "form.css",
      "dialog.css",
      "disclosure.css",
      "tabs.css",
      "menu.css",
      "popover.css",
      "toast.css",
      "progress.css",
      "table.css",
      "skeleton.css",
      "spinner.css",
      "pagination.css",
      "slider.css",
      "tooltip.css",
      "combobox.css",
      "input-group.css",
      "segmented.css",
      "drawer.css",
      "description-list.css",
      "rating.css",
      "otp.css",
      "tags-input.css",
    ];
    for (const file of components) {
      expect(existsSync(join(distRoot, "components", file)), file).toBe(true);
    }
  });

  it("behavior JS files exist", () => {
    const behaviors = [
      "dismissible.js",
      "dialog.js",
      "tabs.js",
      "menu-button.js",
      "popover.js",
      "toast.js",
      "combobox.js",
      "password-toggle.js",
      "number-stepper.js",
      "autosize.js",
      "otp.js",
      "tags-input.js",
      "rating.js",
    ];
    for (const file of behaviors) {
      expect(existsSync(join(distRoot, "behaviors", file)), file).toBe(true);
    }
  });

  it("custom element JS files exist", () => {
    const elements = ["re-tabs.js", "re-toast.js", "re-menu.js", "re-popover.js"];
    for (const file of elements) {
      expect(existsSync(join(distRoot, "elements", file)), file).toBe(true);
    }
  });

  it("theme CSS file exists", () => {
    expect(existsSync(join(distRoot, "themes", "renascent.css"))).toBe(true);
  });

  it("theme CSS exposes light + dark force classes and light scheme", () => {
    const css = readFileSync(join(distRoot, "themes", "renascent.css"), "utf8");
    expect(css).toContain(".theme-renascent-light");
    expect(css).toContain(".theme-renascent-dark");
    expect(css).toMatch(/prefers-color-scheme:\s*light/);
  });

  it("theme CSS exposes the per-scheme --re-rn-* palette vars", () => {
    const css = readFileSync(join(distRoot, "themes", "renascent.css"), "utf8");
    expect(css).toContain("--re-rn-light-bg");
    expect(css).toContain("--re-rn-dark-bg");
    expect(css).toContain("--re-rn-light-accent-600");
    expect(css).toContain("--re-rn-dark-accent-600");
  });
});
