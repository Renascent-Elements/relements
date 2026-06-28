import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import pkg from "../../packages/core/package.json" with { type: "json" };

// What the in-repo exports.spec CAN'T see: it checks the exports MAP + that the
// targets exist in the working tree. It cannot catch a target that the `files`
// field never packs, nor prove a real consumer can resolve the published subpaths
// from an installed tarball. These tests pack + install the actual artifact.

const coreRoot = join(import.meta.dirname, "../../packages/core");
const exportsMap = pkg.exports as Record<string, unknown>;

/** Parse `npm pack --json` defensively — its shape has shifted across npm majors,
 *  and a pack error returns `{ error }`, so fail with a readable message. */
function packManifest(out: string): { filename: string; files: { path: string }[] } {
  const parsed = JSON.parse(out);
  if (!Array.isArray(parsed) || !parsed[0]?.files) {
    throw new Error(`unexpected \`npm pack --json\` output: ${out.slice(0, 200)}`);
  }
  return parsed[0];
}

/** Every file path an exports entry (any condition) or `web-types` points at. */
function exportTargets(): string[] {
  const targets = new Set<string>();
  const add = (v: unknown) => {
    if (typeof v === "string") targets.add(v.replace(/^\.\//, ""));
    else if (v && typeof v === "object")
      for (const cond of Object.values(v as Record<string, unknown>)) add(cond);
  };
  for (const v of Object.values(exportsMap)) add(v);
  add((pkg as { "web-types": string })["web-types"]);
  targets.delete("package.json"); // npm always includes it; not subject to `files`
  return [...targets];
}

/** Every documented import specifier, as a consumer writes it. */
function specifiers(): string[] {
  return Object.keys(exportsMap)
    .filter((k) => k !== "./package.json")
    .map((k) => "@relements/core" + k.slice(1));
}

describe("published tarball", () => {
  const work = mkdtempSync(join(tmpdir(), "relements-pkg-"));
  afterAll(() => rmSync(work, { recursive: true, force: true }));

  it("ships every file its exports map + web-types point at", () => {
    const out = execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
      cwd: coreRoot,
      encoding: "utf8",
    });
    const packed = new Set(packManifest(out).files.map((f) => f.path));
    const missing = exportTargets().filter((t) => !packed.has(t));
    expect(
      missing,
      `exports targets absent from the packed tarball: ${missing.join(", ")}`,
    ).toEqual([]);
  });

  it("installs as a real consumer and resolves every documented subpath to a shipped file", () => {
    // Pack a real tarball (core has zero runtime deps → the install is offline).
    const packed = execFileSync(
      "npm",
      ["pack", "--json", "--ignore-scripts", "--pack-destination", work],
      { cwd: coreRoot, encoding: "utf8" },
    );
    const tgz = join(work, packManifest(packed).filename);

    const consumer = join(work, "consumer");
    mkdirSync(consumer);
    writeFileSync(
      join(consumer, "package.json"),
      JSON.stringify({ name: "consumer", private: true, type: "module" }),
    );
    // Hermetic install: an empty userconfig (never the developer's ~/.npmrc, which
    // may hold auth tokens), offline, and no install scripts.
    const npmrc = join(work, ".npmrc");
    writeFileSync(npmrc, "");
    execFileSync("npm", ["install", tgz, "--no-audit", "--no-fund", "--ignore-scripts"], {
      cwd: consumer,
      stdio: "pipe",
      env: { ...process.env, npm_config_userconfig: npmrc, npm_config_offline: "true" },
    });

    // From the installed package: resolve EVERY documented subpath through Node's
    // exports algorithm AND stat the target to prove the file actually shipped
    // (resolve alone only validates the map). Then execute-import the SSR-safe
    // representatives (root + two behaviors) for API shape — element modules
    // subclass HTMLElement and throw in Node by design, so they're resolve-only;
    // their runtime is covered by the framework e2e suite.
    const script = `
      import { statSync } from "node:fs";
      import { fileURLToPath } from "node:url";
      const specifiers = ${JSON.stringify(specifiers())};
      for (const s of specifiers) statSync(fileURLToPath(import.meta.resolve(s)));
      const tabs = await import("@relements/core/behaviors/tabs");
      const carousel = await import("@relements/core/behaviors/carousel");
      await import("@relements/core"); // root must be Node-import-safe (no top-level DOM)
      if (typeof tabs.enhanceTabs !== "function") throw new Error("enhanceTabs is not a function");
      if (typeof carousel.enhanceCarousel !== "function") throw new Error("enhanceCarousel missing");
      console.log("CONSUMER_OK");
    `;
    const out = execFileSync("node", ["--input-type=module", "-e", script], {
      cwd: consumer,
      encoding: "utf8",
    });
    expect(out).toContain("CONSUMER_OK");
  }, 60_000);
});
