import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// docs/SCREEN_READER_TESTING.md quotes each behavior's live-region copy verbatim
// (e.g. `"N selected"`, `"No results for …"`). Nothing else ties the doc to the
// source, so it's the "stale-but-green" trap CLAUDE.md calls out for visual
// baselines / editor-data: rename a string in a behavior and the doc silently
// rots, sending a future tester to chase a "deviation" that's really doc drift.
//
// This guards the highest-churn case: for each fragment, assert it still appears
// in BOTH the doc AND the owning behavior source — so changing either side
// without the other fails CI. It checks substrings, not semantics. Curated like
// editor-data.spec: a NEW behavior with a live region should add a row here.

const root = join(import.meta.dirname, "../..");
const doc = readFileSync(join(root, "docs/SCREEN_READER_TESTING.md"), "utf8");
const behaviorSrc = (file: string) =>
  readFileSync(join(root, "packages/core/src/behaviors", file), "utf8");

// [ owning behavior file, a verbatim slice of its live-region template ]
const LIVE_REGION_COPY: [string, string][] = [
  ["multiselect.js", "selected"], // `${labels.length} selected`
  ["command-palette.js", "No results for"], // `No results for "${q}".`
  ["command-palette.js", "result"], // `${n} result${…}`
  ["carousel.js", "automatic slideshow"], // Pause/Play button label
  ["carousel.js", "Slide "], // `Slide ${i + 1} of …`
  ["tags-input.js", "Added "], // `Added ${tag}`
  ["tags-input.js", "Removed "], // `Removed ${name}`
  ["tags-input.js", "is already added"], // `${tag} is already added`
  ["tags-input.js", "tags reached"], // `Maximum ${max} tags reached`
  ["file-picker.js", "Selection cleared"],
];

describe("SCREEN_READER_TESTING.md stays in sync with live-region copy", () => {
  it.each(LIVE_REGION_COPY)("%s still emits %j, and the doc documents it", (file, fragment) => {
    expect(
      behaviorSrc(file),
      `${file} no longer emits "${fragment}" — update the source or docs/SCREEN_READER_TESTING.md`,
    ).toContain(fragment);
    expect(
      doc,
      `docs/SCREEN_READER_TESTING.md no longer documents "${fragment}" (from ${file})`,
    ).toContain(fragment);
  });
});
