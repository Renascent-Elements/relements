import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

// The library's pitch: one package, subpath exports for granularity, JS optional.
// So `import { enhanceTabs } from "@relements/core/behaviors/tabs"` must pull in
// ONLY tabs — never its siblings. tsup bundles each behavior entry into a stub
// (`export { enhanceTabs } from '../chunk-XXXX.js'`) that re-exports from one or
// more shared chunks. The risk: an accidental barrel re-export, a misconfigured
// `sideEffects`, or a treeshake regression that drags a sibling's code into a
// behavior's chunk closure — bloating every consumer, silently.
//
// Proxy for "X does not include Y's code": a sibling's UNIQUE public export
// identifier (enhanceX / showX) must not appear anywhere in X's transitive chunk
// closure. A shared *private* helper duplicated across chunks is fine — only the
// public export names are unique per module, so only they signal cross-pollution.

const behaviorsDir = join(import.meta.dirname, "../../packages/core/dist/behaviors");

/** Public export identifiers + directly-referenced module paths in a stub/chunk. */
function parse(file: string): { names: Set<string>; deps: string[] } {
  const text = readFileSync(file, "utf8");
  const names = new Set<string>();
  for (const block of text.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of block[1].split(",")) {
      // `a as enhanceX` → enhanceX; `enhanceX` → enhanceX.
      const name = part
        .trim()
        .split(/\s+as\s+/)
        .pop()
        ?.trim();
      if (name) names.add(name);
    }
  }
  const deps: string[] = [];
  // Follow only RELATIVE imports (bundled chunks); externals are skipped.
  for (const ref of text.matchAll(/from\s*['"](\.[^'"]+)['"]/g)) {
    const p = resolve(dirname(file), ref[1]);
    if (existsSync(p)) deps.push(p);
  }
  return { names, deps };
}

/** Concatenated text of every chunk reachable from a behavior's stub. */
function closureText(stub: string): string {
  const seen = new Set<string>();
  const queue = parse(stub).deps;
  while (queue.length) {
    const c = queue.pop()!;
    if (seen.has(c)) continue;
    seen.add(c);
    queue.push(...parse(c).deps);
  }
  return [...seen].map((c) => readFileSync(c, "utf8")).join("\n");
}

describe("subpath tree-shaking — no behavior bundles a sibling", () => {
  const stubs = readdirSync(behaviorsDir).filter((f) => f.endsWith(".js"));
  const ownNames = new Map(stubs.map((f) => [f, parse(join(behaviorsDir, f)).names]));

  it("derives a public export name from every behavior stub (sanity)", () => {
    for (const [file, names] of ownNames) {
      expect(names.size, `${file} exposes no public export`).toBeGreaterThan(0);
    }
  });

  it.each(stubs)("dist/behaviors/%s pulls in no sibling behavior's code", (file) => {
    const self = ownNames.get(file)!;
    const foreign = new Set<string>();
    for (const [other, names] of ownNames) {
      if (other === file) continue;
      for (const n of names) if (!self.has(n)) foreign.add(n);
    }
    const code = closureText(join(behaviorsDir, file));
    // Non-vacuous: the closure really is this behavior's code, so a clean result
    // means "sibling absent", not "closure empty / regex broken".
    for (const own of self) {
      expect(code, `${file} closure is missing its own export ${own}`).toMatch(
        new RegExp(`\\b${own}\\b`),
      );
    }
    const leaked = [...foreign].filter((n) => new RegExp(`\\b${n}\\b`).test(code));
    expect(leaked, `${file} bundles sibling export(s): ${leaked.join(", ")}`).toEqual([]);
  });
});
