#!/usr/bin/env node
/**
 * Generate the token-reference docs page from the single source of truth,
 * packages/core/src/tokens.css. Run: `node scripts/gen-token-reference.mjs`.
 * The drift guard in tests/unit/token-reference.spec.ts fails CI if the checked-in
 * page omits any public token, so regenerate after touching tokens.css.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOKENS = join(root, "packages/core/src/tokens.css");
const OUT = join(root, "docs/public/src/content/docs/guides/tokens.mdx");

const src = readFileSync(TOKENS, "utf8");
const [lightSrc, darkSrc = ""] = src.split("@media (prefers-color-scheme: dark)");

/** Parse a CSS block into ordered categories of { name, value, comment }. */
function parse(block) {
  const order = [];
  const cats = new Map();
  let cur = "General";
  let buf = "";
  for (const line of block.split("\n")) {
    const head = line.match(/\/\*\s*-+\s*(.+?)\s*-+\s*\*\//);
    if (head) {
      cur = head[1].replace(/\s*\(light\)\s*/, "").trim();
      buf = "";
      continue;
    }
    buf += " " + line.trim();
    const m = buf.trim().match(/(--re-[\w-]+)\s*:\s*(.+?);\s*(?:\/\*\s*(.*?)\s*\*\/)?\s*$/);
    if (m) {
      const name = m[1];
      const value = m[2].replace(/\s+/g, " ").trim();
      if (!cats.has(cur)) {
        cats.set(cur, []);
        order.push(cur);
      }
      cats.get(cur).push({ name, value });
      buf = "";
    }
  }
  return { order, cats };
}

const { order, cats } = parse(lightSrc);
const dark = new Map();
for (const list of parse(darkSrc).cats.values()) for (const t of list) dark.set(t.name, t.value);

const lines = [
  "---",
  "title: Token reference",
  "description: Every --re-* design token — the stable, themeable public API of @relements/core.",
  "---",
  "",
  "Every value in the system is a `--re-*` CSS custom property. They are **stable public API** (see [versioning](/relements/guides/versioning/)) — override any of them at `:root` for a global change, or on any ancestor to re-theme a subtree. Values shown are the defaults; the **Dark** column lists the value under `prefers-color-scheme: dark` (and the built-in theme) when it differs. See [dark mode](/relements/guides/dark-mode/) for how that switch works.",
  "",
  "{/* AUTO-GENERATED from packages/core/src/tokens.css by scripts/gen-token-reference.mjs — run `node scripts/gen-token-reference.mjs` after editing tokens; the drift guard in tests/unit/token-reference.spec.ts enforces it. */}",
  "",
];
for (const cat of order) {
  lines.push(`## ${cat}`, "", "| Token | Default | Dark |", "| ----- | ------- | ---- |");
  for (const { name, value } of cats.get(cat)) {
    const d = dark.get(name);
    lines.push(`| \`${name}\` | \`${value}\` | ${d && d !== value ? `\`${d}\`` : "—"} |`);
  }
  lines.push("");
}
writeFileSync(OUT, lines.join("\n") + "\n");
const total = order.reduce((n, c) => n + cats.get(c).length, 0);
console.log(
  `wrote ${OUT} — ${total} tokens, ${order.length} categories, ${dark.size} dark overrides`,
);
