/**
 * CSS build script for @relements/core.
 *
 * Uses lightningcss to:
 *   1. Bundle src/index.css (resolves @imports) → dist/index.css
 *   2. Minify individual component / theme files → dist/**
 *
 * Run via: node build-css.mjs
 */

import { transform, bundle } from "lightningcss";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "fs";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(__dirname, "src");
const dist = join(__dirname, "dist");

/** @param {string} dir */
function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

/**
 * Bundle a CSS entry (resolves @imports) and write to dist.
 * @param {string} inputPath  absolute path to input file
 * @param {string} outputPath absolute path to output file
 */
function bundleFile(inputPath, outputPath) {
  const { code } = bundle({
    filename: inputPath,
    minify: true,
    targets: { chrome: 111 << 16, firefox: 113 << 16, safari: (16 << 16) | (4 << 8) },
  });
  ensureDir(dirname(outputPath));
  writeFileSync(outputPath, code);
  const kb = (code.length / 1024).toFixed(1);
  console.log(`  ✓ ${relative(__dirname, outputPath)} (${kb} KB)`);
}

/**
 * Minify a standalone CSS file (no @import resolution) and write to dist.
 * @param {string} inputPath
 * @param {string} outputPath
 */
function minifyFile(inputPath, outputPath) {
  const source = readFileSync(inputPath);
  const { code } = transform({
    filename: inputPath,
    code: source,
    minify: true,
    targets: { chrome: 111 << 16, firefox: 113 << 16, safari: (16 << 16) | (4 << 8) },
  });
  ensureDir(dirname(outputPath));
  writeFileSync(outputPath, code);
  const kb = (code.length / 1024).toFixed(1);
  console.log(`  ✓ ${relative(__dirname, outputPath)} (${kb} KB)`);
}

/**
 * Recursively minify all .css files in a directory.
 * @param {string} srcDir  absolute src dir
 * @param {string} distDir absolute dist dir
 */
function minifyDir(srcDir, distDir) {
  for (const entry of readdirSync(srcDir)) {
    const srcPath = join(srcDir, entry);
    const distPath = join(distDir, entry);
    if (statSync(srcPath).isDirectory()) {
      minifyDir(srcPath, distPath);
    } else if (entry.endsWith(".css")) {
      minifyFile(srcPath, distPath);
    }
  }
}

// ── Build ────────────────────────────────────────────────────────────────────

console.log("Building CSS…");

// 1. Fully-bundled entry (resolves all @imports into one file)
bundleFile(join(src, "index.css"), join(dist, "index.css"));

// 2. Individual layer files (consumers who import selectively)
for (const file of ["tokens.css", "reset.css", "base.css"]) {
  minifyFile(join(src, file), join(dist, file));
}

// 3. Component stylesheets
minifyDir(join(src, "components"), join(dist, "components"));

// 4. Theme files
minifyDir(join(src, "themes"), join(dist, "themes"));

console.log("CSS build complete.");
