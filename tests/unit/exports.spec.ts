import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";
import pkg from "../../packages/core/package.json" with { type: "json" };

const coreRoot = join(import.meta.dirname, "../../packages/core");
const distRoot = join(coreRoot, "dist");
const exportsMap = pkg.exports as Record<string, unknown>;
const cssFiles = (dir: string) =>
  readdirSync(join(coreRoot, "src", dir)).filter((f) => f.endsWith(".css"));
const jsFiles = (dir: string) =>
  readdirSync(join(coreRoot, "src", dir)).filter((f) => f.endsWith(".js"));

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

  it("dist component CSS exists for every source component", () => {
    for (const file of cssFiles("components")) {
      expect(existsSync(join(distRoot, "components", file)), file).toBe(true);
    }
  });

  it("dist behavior JS + d.ts exist for every source behavior", () => {
    for (const file of jsFiles("behaviors")) {
      expect(existsSync(join(distRoot, "behaviors", file)), file).toBe(true);
      expect(existsSync(join(distRoot, "behaviors", file.replace(/\.js$/, ".d.ts"))), file).toBe(
        true,
      );
    }
  });

  it("dist custom-element JS exists for every source element", () => {
    for (const file of jsFiles("elements")) {
      expect(existsSync(join(distRoot, "elements", file)), file).toBe(true);
    }
  });
});

// Drift guard: a new component/behavior/element must be wired everywhere, not
// just dropped in src. Derives the lists from the source tree so the wiring
// can't silently fall out of sync (no hand-maintained list to forget).
describe("@relements/core wiring (no drift)", () => {
  const indexCss = readFileSync(join(coreRoot, "src", "index.css"), "utf8");

  it("every component CSS is @imported in index.css AND exported in package.json", () => {
    for (const file of cssFiles("components")) {
      expect(indexCss, `${file} missing from index.css`).toContain(`./components/${file}`);
      expect(exportsMap[`./components/${file}`], `${file} missing from package.json exports`).toBe(
        `./dist/components/${file}`,
      );
    }
  });

  it("every behavior is exported in package.json", () => {
    for (const file of jsFiles("behaviors")) {
      const key = `./behaviors/${file.replace(/\.js$/, "")}`;
      expect(exportsMap[key], `${file} missing from package.json exports`).toBeTruthy();
    }
  });

  it("every custom element is exported in package.json", () => {
    for (const file of jsFiles("elements")) {
      const key = `./elements/${file.replace(/\.js$/, "")}`;
      expect(exportsMap[key], `${file} missing from package.json exports`).toBeTruthy();
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
