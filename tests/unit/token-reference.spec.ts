import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..", "..");
const tokensCss = readFileSync(join(root, "packages/core/src/tokens.css"), "utf8");
const doc = readFileSync(join(root, "docs/public/src/content/docs/guides/tokens.mdx"), "utf8");

// Public tokens = those defined in the light :root block (before the dark @media).
const lightBlock = tokensCss.split("@media (prefers-color-scheme: dark)")[0];
const publicTokens = [...new Set([...lightBlock.matchAll(/(--re-[\w-]+)\s*:/g)].map((m) => m[1]))];

describe("token reference doc", () => {
  it("documents every public --re-* token (regenerate via scripts/gen-token-reference.mjs)", () => {
    expect(publicTokens.length).toBeGreaterThan(100);
    const missing = publicTokens.filter((t) => !doc.includes(`\`${t}\``));
    expect(missing, `undocumented tokens — run \`node scripts/gen-token-reference.mjs\``).toEqual(
      [],
    );
  });
});
