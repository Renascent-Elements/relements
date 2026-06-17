import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
// @ts-expect-error — plain ESM script, no type declarations.
import { htmlData, cssData, webTypes, elementTags } from "../../scripts/gen-editor-data.mjs";
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

  it("web-types.json is up to date (version-independent; regenerate via `node scripts/gen-editor-data.mjs`)", () => {
    // `version` tracks package.json and is refreshed at publish (prepublishOnly),
    // so a Changesets bump must not fail this guard — compare everything else.
    const strip = (o: Record<string, unknown>) => ({ ...o, version: undefined });
    expect(strip(read("web-types.json"))).toEqual(strip(webTypes));
  });

  it("curates every shipped custom element (no element silently missing from IntelliSense)", () => {
    // Source of truth = the actual element modules. If they drift from the curated
    // ELEMENTS list, the message says exactly which file needs an entry.
    const shipped = readdirSync(join(core, "src/elements"))
      .filter((f) => f.endsWith(".js"))
      .map((f) => f.replace(/\.js$/, ""))
      .sort();
    expect(
      [...elementTags].sort(),
      "add/remove the element in ELEMENTS in scripts/gen-editor-data.mjs to match src/elements/*.js",
    ).toEqual(shipped);
  });

  it("covers the curated custom-element tags and the core styling attributes", () => {
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

  it("is published — custom-data in files + exports, web-types in files + the web-types field", () => {
    const exportsMap = pkg.exports as Record<string, unknown>;
    for (const file of ["html.custom-data.json", "css.custom-data.json"]) {
      expect(pkg.files, `${file} missing from files`).toContain(file);
      expect(exportsMap[`./${file}`], `${file} missing from exports`).toBe(`./${file}`);
    }
    expect(pkg.files, "web-types.json missing from files").toContain("web-types.json");
    expect((pkg as { "web-types"?: string })["web-types"], "web-types field missing").toBe(
      "./web-types.json",
    );
  });
});
