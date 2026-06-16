import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
// @ts-expect-error — plain ESM script, no type declarations.
import { htmlData, cssData } from "../../scripts/gen-editor-data.mjs";
import pkg from "../../packages/core/package.json" with { type: "json" };

const core = join(__dirname, "..", "..", "packages/core");
const read = (file: string) => JSON.parse(readFileSync(join(core, file), "utf8"));

describe("editor custom-data", () => {
  it("html.custom-data.json is up to date (regenerate via `node scripts/gen-editor-data.mjs`)", () => {
    expect(read("html.custom-data.json")).toEqual(htmlData);
  });

  it("css.custom-data.json is up to date (regenerate via `node scripts/gen-editor-data.mjs`)", () => {
    expect(read("css.custom-data.json")).toEqual(cssData);
  });

  it("covers the four custom-element tags and the core styling attributes", () => {
    const tagNames = htmlData.tags.map((t: { name: string }) => t.name);
    expect(tagNames).toEqual(["re-tabs", "re-menu", "re-popover", "re-toast"]);

    const attrs = new Map(
      htmlData.globalAttributes.map((a: { name: string; values?: { name: string }[] }) => [
        a.name,
        (a.values ?? []).map((v) => v.name),
      ]),
    );
    expect(attrs.get("data-variant")).toContain("primary");
    expect(attrs.get("data-tone")).toEqual(
      expect.arrayContaining(["info", "success", "warning", "danger", "neutral"]),
    );
    // Declarative hooks are present, internal *-ready markers are not.
    expect(attrs.has("data-re-dialog-trigger")).toBe(true);
    expect([...attrs.keys()].some((k) => String(k).endsWith("-ready"))).toBe(false);
  });

  it("exposes every public --re-* token as a CSS property", () => {
    expect(cssData.properties.length).toBeGreaterThan(100);
    expect(cssData.properties.every((p: { name: string }) => p.name.startsWith("--re-"))).toBe(
      true,
    );
  });

  it("is published — both files are in package.json files + exports", () => {
    const exportsMap = pkg.exports as Record<string, unknown>;
    for (const file of ["html.custom-data.json", "css.custom-data.json"]) {
      expect(pkg.files, `${file} missing from files`).toContain(file);
      expect(exportsMap[`./${file}`], `${file} missing from exports`).toBe(`./${file}`);
    }
  });
});
