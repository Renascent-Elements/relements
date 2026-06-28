import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

// The library's pitch: one package, subpath exports for granularity, JS optional.
// So `import { enhanceTabs } from "@relements/core/behaviors/tabs"` must pull in
// ONLY tabs — never its siblings. tsup bundles each behavior entry into a stub
// (`export { enhanceTabs } from '../chunk-XXXX.js'`) that re-exports from a chunk.
// The risk: an accidental barrel re-export, a misconfigured `sideEffects`, or a
// treeshake regression that drags a sibling's code into a behavior's chunk —
// bloating every consumer, silently.
//
// Ground truth comes from SOURCE (`src/behaviors/*.js`), never from the dist stub
// under test: a barrel must not be able to define its own "own exports" and so
// launder a leaked sibling into the allow-list. The proxy for "X bundles Y's
// code" is "Y's unique public export identifier appears in X's chunk".

const coreRoot = join(import.meta.dirname, "../../packages/core");
const srcBehaviorsDir = join(coreRoot, "src/behaviors");
const distBehaviorsDir = join(coreRoot, "dist/behaviors");

/** Public function names a source behavior exports (the authoritative API). */
function sourceExports(file: string): string[] {
  const text = readFileSync(join(srcBehaviorsDir, file), "utf8");
  return [...text.matchAll(/^export\s+function\s+(\w+)/gm)].map((m) => m[1]);
}

/** `{ ... }` re-export identifiers a dist stub exposes (alias target wins). */
function stubExports(text: string): string[] {
  return [...text.matchAll(/export\s*\{([^}]*)\}/g)].flatMap((block) =>
    block[1]
      .split(",")
      .map((p) =>
        p
          .trim()
          .split(/\s+as\s+/)
          .pop()
          ?.trim(),
      )
      .filter((n): n is string => Boolean(n)),
  );
}

/** Resolved paths of every RELATIVE module a file pulls in — covering re-export,
 *  static side-effect, and dynamic import forms (so a sibling pulled in by any of
 *  them is visible, not just `… from "./x"`). */
function relativeRefs(text: string, fromFile: string): string[] {
  const out = new Set<string>();
  const patterns = [
    /from\s*['"](\.[^'"]+)['"]/g, // import/export … from "./x"
    /\bimport\s+['"](\.[^'"]+)['"]/g, // side-effect import "./x"
    /\bimport\s*\(\s*['"](\.[^'"]+)['"]\s*\)/g, // dynamic import("./x")
  ];
  for (const re of patterns)
    for (const m of text.matchAll(re)) {
      const p = resolve(dirname(fromFile), m[1]);
      if (existsSync(p)) out.add(p);
    }
  return [...out];
}

describe("subpath tree-shaking — no behavior bundles a sibling", () => {
  const behaviors = existsSync(srcBehaviorsDir)
    ? readdirSync(srcBehaviorsDir).filter((f) => f.endsWith(".js"))
    : [];
  const ownNames = new Map(behaviors.map((f) => [f, sourceExports(f)]));

  it("enumerated the behavior set from source (guards a missing/partial build)", () => {
    expect(behaviors.length).toBeGreaterThanOrEqual(20);
    for (const [file, names] of ownNames) {
      expect(names.length, `${file}: expected ≥1 exported function`).toBeGreaterThanOrEqual(1);
    }
  });

  it.each(behaviors)(
    "dist/behaviors/%s re-exports only its source API + bundles no sibling",
    (file) => {
      const own = ownNames.get(file)!;
      const stubPath = join(distBehaviorsDir, file);
      expect(
        existsSync(stubPath),
        `${file}: no dist stub — run \`pnpm -F @relements/core build\` first`,
      ).toBe(true);

      // (a) The stub must re-export EXACTLY the source's public API. A barrel that
      // re-exported siblings would surface extra names here and fail — this is what
      // stops a leaked sibling from being laundered into `own`.
      const stub = readFileSync(stubPath, "utf8");
      expect(
        stubExports(stub).sort(),
        `${file}: stub re-exports more/other than its source`,
      ).toEqual([...own].sort());

      // (b) The behavior's code = the chunk(s) the stub re-exports from. Assert those
      // chunks are FLAT (import no further chunk), so reading them directly is the
      // whole closure. If tsup ever shares code across chunks, this fails loudly
      // instead of silently under-checking — no transitive walk to get subtly wrong.
      const chunks = relativeRefs(stub, stubPath);
      expect(chunks.length, `${file}: stub references no chunk`).toBeGreaterThan(0);
      for (const chunk of chunks) {
        expect(
          relativeRefs(readFileSync(chunk, "utf8"), chunk),
          `${file}: a chunk imports another chunk — closure is no longer depth-1`,
        ).toEqual([]);
      }
      const code = chunks.map((c) => readFileSync(c, "utf8")).join("\n");

      // (c) Non-vacuous: the behavior's own API really is in its chunk(s)…
      for (const name of own) {
        expect(code, `${file}: closure is missing its own export ${name}`).toMatch(
          new RegExp(`\\b${name}\\b`),
        );
      }

      // (d) …and NO sibling's public export name appears.
      const foreign = new Set<string>();
      for (const [other, names] of ownNames) {
        if (other === file) continue;
        for (const n of names) if (!own.includes(n)) foreign.add(n);
      }
      const leaked = [...foreign].filter((n) => new RegExp(`\\b${n}\\b`).test(code));
      expect(leaked, `${file} bundles sibling export(s): ${leaked.join(", ")}`).toEqual([]);
    },
  );
});
