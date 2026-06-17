#!/usr/bin/env node
/**
 * Generate the VS Code editor custom-data files that give consumers
 * IntelliSense for Relements:
 *
 *   packages/core/html.custom-data.json — the four <re-*> custom-element tags
 *     plus the authored data-* attributes (styling hooks like data-variant /
 *     data-tone and the declarative data-re-* behavior hooks), with enumerated
 *     value sets where the CSS defines a finite set.
 *   packages/core/css.custom-data.json — every --re-* design token, so
 *     `var(--re-…)` autocompletes and hovers show the default (and dark) value.
 *
 * The *structure* (tag names, attribute names, value sets, token names/values)
 * is derived from source — tokens.css, the component CSS, and the behavior JS —
 * so it can't drift. Human-readable *descriptions* come from the small curated
 * maps below. Run: `node scripts/gen-editor-data.mjs`. The drift guard in
 * tests/unit/editor-data.spec.ts fails CI if the checked-in files are stale.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const core = join(root, "packages/core");
const componentsDir = join(core, "src/components");
const behaviorsDir = join(core, "src/behaviors");
const DOCS = "https://renascent-elements.github.io/relements";

// ---------------------------------------------------------------------------
// Curated copy. Keys that the generator discovers but does not find here still
// autocomplete by name; this map only supplies the hover descriptions.
// ---------------------------------------------------------------------------

/** The four light-DOM custom elements. */
const ELEMENTS = [
  {
    name: "re-tabs",
    description:
      'Self-managing wrapper around the tabs pattern (enhanceTabs). `element.value` reads/writes the selected tab id; emits `re-change`. Register with `import "@relements/core/elements/re-tabs"`.',
    slug: "re-tabs",
    attributes: [{ name: "aria-label", description: "Accessible name for the tablist." }],
  },
  {
    name: "re-menu",
    description:
      'Self-managing wrapper around the menu-button pattern (enhanceMenuButton). `element.open` reflects/controls the open state; emits `re-select`. Register with `import "@relements/core/elements/re-menu"`.',
    slug: "re-menu",
    attributes: [],
  },
  {
    name: "re-popover",
    description:
      'Self-managing wrapper around the native popover attribute (enhancePopover). Auto-adopts `popover="auto"`; `.show()`/`.hide()`/`.toggle()` map to the native API; emits `re-toggle`. Register with `import "@relements/core/elements/re-popover"`.',
    slug: "re-popover",
    attributes: [],
  },
  {
    name: "re-toast",
    description:
      'Self-managing toast region in light DOM. `.show(message, options)` matches showToast() and returns the same controller. Register with `import "@relements/core/elements/re-toast"`.',
    slug: "re-toast",
    attributes: [
      {
        name: "data-live",
        description: "Live-region politeness for announcements.",
        values: ["polite", "assertive"],
      },
    ],
  },
];

/** Per-element JS surface (reflected properties + emitted events) for web-types. */
const ELEMENT_JS = {
  "re-tabs": {
    properties: [{ name: "value", type: "string", description: "The selected tab id." }],
    events: [{ name: "re-change", description: "Fires when the selected tab changes." }],
  },
  "re-menu": {
    properties: [{ name: "open", type: "boolean", description: "Whether the menu is open." }],
    events: [{ name: "re-select", description: "Fires when a menu item is selected." }],
  },
  "re-popover": {
    properties: [],
    events: [{ name: "re-toggle", description: "Fires when the popover opens or closes." }],
  },
  "re-toast": { properties: [], events: [] },
};

/** Descriptions for the styling data-* attributes (values are derived from CSS). */
const STYLING_ATTR_DESC = {
  "data-variant": "Structural variant of a component (e.g. button/link/table style).",
  "data-tone": "Semantic color tone (info / success / warning / danger / neutral).",
  "data-size": "Control size.",
  "data-emphasis": "Visual emphasis — `solid` uses a filled status surface.",
  "data-placement": "Placement of a floating part (tooltip bubble, etc.) around its anchor.",
  "data-side": "Side a part attaches to.",
  "data-orientation": "Layout axis.",
  "data-layout": "Layout direction.",
  "data-align": "Alignment of content.",
  "data-density": "Spacing density.",
  "data-shape": "Shape variant (e.g. avatar circle / square / text).",
  "data-status": "Step/item status (e.g. complete / current).",
};

/**
 * Canonical values that are the *default* appearance and so have no
 * `[data-x="…"]` selector to derive from, but are documented opt-ins.
 */
const VALUE_SUPPLEMENT = {
  "data-variant": ["primary"],
  "data-size": ["md"],
  "data-tone": ["neutral"],
};

/** Boolean styling attributes (no value) and their descriptions. */
const BOOLEAN_ATTR_DESC = {
  "data-open": "Force the open/visible state without interaction.",
  "data-sticky": "Stick the element to the viewport edge while scrolling.",
  "data-invalid": "Mark the control as invalid (error styling).",
  "data-required": "Mark the field as required.",
  "data-full-width": "Stretch to the full available inline size.",
  "data-bordered": "Add a border.",
  "data-divided": "Add dividers between items.",
  "data-zebra": "Striped (zebra) rows.",
  "data-wrap": "Allow items to wrap.",
  "data-hover": "Force the hover state (demo/visual aid).",
  "data-interactive": "Make the element interactive (hover/active affordances).",
  "data-autosize": "Grow a textarea to fit its content.",
  "data-sticky-header": "Keep the table header visible while scrolling.",
};

/** Descriptions for the declarative data-re-* behavior hooks. */
const HOOK_DESC = {
  "data-re-dialog-trigger": "Marks a button that opens its target dialog (enhanceDialog).",
  "data-re-dialog-target": "Id of the dialog a trigger opens.",
  "data-re-dialog-close": "Marks a button that closes the enclosing dialog.",
  "data-re-dialog-close-on-backdrop": "Dismiss the dialog on backdrop click.",
  "data-re-dialog-no-dismiss": "Prevent Escape/backdrop dismissal.",
  "data-re-dismiss":
    "Marks a button that dismisses its dismissible container (enhanceDismissible).",
  "data-re-dismissible": "Marks a container that can be dismissed.",
  "data-re-tabs": "Host element for enhanceTabs.",
  "data-re-menu": "Host element for enhanceMenuButton.",
  "data-re-popover": "Host element for enhancePopover.",
  "data-re-combobox": "Host element for enhanceCombobox.",
  "data-re-context-menu": "Host element for enhanceContextMenu.",
  "data-re-command-palette": "Host dialog for enhanceCommandPalette.",
  "data-re-command-hotkey": "Keyboard shortcut that opens the command palette (e.g. `mod+k`).",
};

// ---------------------------------------------------------------------------
// Derivation from source.
// ---------------------------------------------------------------------------

const readDir = (dir, ext) =>
  readdirSync(dir)
    .filter((f) => f.endsWith(ext))
    .map((f) => readFileSync(join(dir, f), "utf8"));

// Strip CSS comments first: the attribute regexes below scan raw selector text,
// and a data-attribute that lived only inside a comment would otherwise leak as a
// phantom authoring value. (A value appearing only inside `:not(…)` is a related
// edge we accept — every value we emit today also has a real positive selector.)
const cssText = readDir(componentsDir, ".css")
  .join("\n")
  .replace(/\/\*[\s\S]*?\*\//g, "");
const behaviorText = readDir(behaviorsDir, ".js").join("\n");

/** data-attr → sorted unique values, parsed from `[data-attr="value"]` selectors. */
function deriveValueSets() {
  const sets = new Map();
  for (const m of cssText.matchAll(/\[(data-[a-z-]+)="([a-z0-9-]+)"\]/g)) {
    const [, attr, value] = m;
    if (!sets.has(attr)) sets.set(attr, new Set());
    sets.get(attr).add(value);
  }
  // Add documented default values that have no selector to derive from.
  for (const [attr, values] of Object.entries(VALUE_SUPPLEMENT)) {
    if (!sets.has(attr)) sets.set(attr, new Set());
    for (const v of values) sets.get(attr).add(v);
  }
  return sets;
}

/** Boolean styling data-attrs: `[data-attr]` with no `=` and not a data-re-* hook. */
function deriveBooleanAttrs(valueSets) {
  const bools = new Set();
  for (const m of cssText.matchAll(/\[(data-[a-z-]+)\]/g)) {
    const attr = m[1];
    if (attr.startsWith("data-re-")) continue;
    if (valueSets.has(attr)) continue;
    bools.add(attr);
  }
  return bools;
}

/** Authored data-re-* hooks from behavior source, minus internal *-ready/-enhanced markers. */
function deriveHooks() {
  const hooks = new Set();
  for (const m of behaviorText.matchAll(/data-re-[a-z-]+/g)) {
    const attr = m[0];
    if (attr.endsWith("-ready") || attr.endsWith("-enhanced")) continue;
    hooks.add(attr);
  }
  return hooks;
}

const valueSets = deriveValueSets();
const booleanAttrs = deriveBooleanAttrs(valueSets);
const hooks = deriveHooks();

// ---------------------------------------------------------------------------
// HTML custom data.
// ---------------------------------------------------------------------------

const tags = ELEMENTS.map((el) => ({
  name: el.name,
  description: el.description,
  attributes: el.attributes.map((a) => ({
    name: a.name,
    ...(a.description ? { description: a.description } : {}),
    ...(a.values ? { values: a.values.map((v) => ({ name: v })) } : {}),
  })),
  references: [{ name: "Documentation", url: `${DOCS}/custom-elements/${el.slug}/` }],
}));

// VS Code custom-data has no per-tag scoping for non-element attributes, so every
// data-* below lands in `globalAttributes` and autocompletes on any element. That
// over-offers (e.g. `data-zebra` shows on a `<div>`) but is the format's only option.
const globalAttributes = [];

// Enumerated styling attributes (data-variant, data-tone, …).
for (const [attr, values] of [...valueSets].sort((a, b) => a[0].localeCompare(b[0]))) {
  if (attr.startsWith("data-re-")) continue;
  globalAttributes.push({
    name: attr,
    description: STYLING_ATTR_DESC[attr] ?? `Relements styling attribute.`,
    values: [...values].sort().map((v) => ({ name: v })),
  });
}

// Boolean styling attributes.
for (const attr of [...booleanAttrs].sort()) {
  globalAttributes.push({
    name: attr,
    description: BOOLEAN_ATTR_DESC[attr] ?? `Relements boolean styling attribute.`,
  });
}

// Declarative data-re-* behavior hooks.
for (const attr of [...hooks].sort()) {
  globalAttributes.push({
    name: attr,
    description: HOOK_DESC[attr] ?? `Relements behavior hook.`,
  });
}

const htmlData = {
  version: 1.1,
  tags,
  globalAttributes,
};

// ---------------------------------------------------------------------------
// CSS custom data — the --re-* tokens.
// ---------------------------------------------------------------------------

const tokensSrc = readFileSync(join(core, "src/tokens.css"), "utf8");
const [lightSrc, darkSrc = ""] = tokensSrc.split("@media (prefers-color-scheme: dark)");

/** Flat name → value from a CSS block (handles multi-line declarations). */
function parseTokens(block) {
  const out = new Map();
  let buf = "";
  for (const line of block.split("\n")) {
    buf += " " + line.trim();
    const m = buf.trim().match(/(--re-[\w-]+)\s*:\s*(.+?);/);
    if (m) {
      out.set(m[1], m[2].replace(/\s+/g, " ").trim());
      buf = "";
    }
  }
  return out;
}

const light = parseTokens(lightSrc);
const dark = parseTokens(darkSrc);

const properties = [...light].map(([name, value]) => {
  const darkValue = dark.get(name);
  const desc =
    darkValue && darkValue !== value ? `\`${value}\` (dark: \`${darkValue}\`)` : `\`${value}\``;
  return {
    name,
    description: { kind: "markdown", value: desc },
    references: [{ name: "Token reference", url: `${DOCS}/guides/tokens/` }],
  };
});

const cssData = {
  version: 1.1,
  properties,
};

// ---------------------------------------------------------------------------
// web-types — the JetBrains (WebStorm / IntelliJ) format. Auto-discovered via
// the `web-types` field in package.json, so it needs no per-project settings.
// Covers the four <re-*> elements (with their JS props/events), the global
// data-* attribute names, and the --re-* tokens as CSS properties. (web-types
// has no compact enum-value form for global attributes, so values are offered
// only by the VS Code custom-data above; here attributes complete by name.)
// ---------------------------------------------------------------------------

const pkgVersion = JSON.parse(readFileSync(join(core, "package.json"), "utf8")).version;

const webTypes = {
  $schema: "http://json.schemastore.org/web-types",
  name: "@relements/core",
  version: pkgVersion,
  "description-markup": "markdown",
  "js-types-syntax": "typescript",
  contributions: {
    html: {
      elements: ELEMENTS.map((el) => {
        const js = ELEMENT_JS[el.name];
        return {
          name: el.name,
          description: el.description,
          "doc-url": `${DOCS}/custom-elements/${el.slug}/`,
          ...(el.attributes.length
            ? {
                attributes: el.attributes.map((a) => ({
                  name: a.name,
                  ...(a.description ? { description: a.description } : {}),
                })),
              }
            : {}),
          ...(js && (js.properties.length || js.events.length)
            ? {
                js: {
                  ...(js.properties.length ? { properties: js.properties } : {}),
                  ...(js.events.length ? { events: js.events } : {}),
                },
              }
            : {}),
        };
      }),
      attributes: globalAttributes.map((a) => ({ name: a.name, description: a.description })),
    },
    css: {
      properties: [...light].map(([name, value]) => {
        const darkValue = dark.get(name);
        return {
          name,
          description:
            darkValue && darkValue !== value
              ? `\`${value}\` (dark: \`${darkValue}\`)`
              : `\`${value}\``,
          "doc-url": `${DOCS}/guides/tokens/`,
        };
      }),
    },
  },
};

// Exported for the drift guard (tests/unit/editor-data.spec.ts).
export { htmlData, cssData, webTypes };

// ---------------------------------------------------------------------------
// Write (only when run directly, not when imported by the drift guard).
// ---------------------------------------------------------------------------

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const write = (file, data) =>
    writeFileSync(join(core, file), JSON.stringify(data, null, 2) + "\n", "utf8");

  write("html.custom-data.json", htmlData);
  write("css.custom-data.json", cssData);
  write("web-types.json", webTypes);

  console.log(
    `editor data: ${tags.length} tags, ${globalAttributes.length} global attributes, ${properties.length} tokens (VS Code custom-data + web-types)`,
  );
}
