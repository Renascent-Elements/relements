/**
 * Stylelint — enforces the @relements/core CSS authoring conventions
 * (see CLAUDE.md "CSS authoring"). Convention-only: Prettier owns formatting, so
 * there are no stylistic rules here, only the house guardrails that the manual
 * reviews kept catching.
 *
 * Scope:
 *   - Floor rules (no `lh` unit, no `:dir()`) apply to ALL source CSS.
 *   - Tokens-only + logical-property rules apply to COMPONENT CSS only —
 *     tokens.css / themes define the raw palette, and base/reset are foundational.
 */

const physicalProperties = [
  "width",
  "height",
  "min-width",
  "max-width",
  "min-height",
  "max-height",
  "top",
  "right",
  "bottom",
  "left",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "border-top",
  "border-right",
  "border-bottom",
  "border-left",
];

/** @type {import("stylelint").Config} */
export default {
  rules: {
    // Browser floor: Chrome 99 / Firefox 97 / Safari 15.4.
    "unit-disallowed-list": [
      ["lh"],
      {
        message:
          "The `lh` unit is above the browser floor (Safari 16.4). Use calc() with em × var(--re-line-height-normal).",
      },
    ],
    "selector-disallowed-list": [
      [/:dir\(/],
      {
        message:
          '`:dir()` is above the browser floor (Safari 16.4). Target RTL with the [dir="rtl"] attribute instead.',
      },
    ],
  },
  overrides: [
    {
      files: ["packages/core/src/components/**/*.css"],
      rules: {
        "color-no-hex": [
          true,
          { message: "Use a --re-color-* token, not a raw hex color (tokens-only)." },
        ],
        "function-disallowed-list": [
          ["rgb", "rgba", "hsl", "hsla"],
          {
            message:
              "Use a --re-color-* token or color-mix(), not a raw color function (tokens-only).",
          },
        ],
        "property-disallowed-list": [
          physicalProperties,
          {
            message:
              "Use the logical property (inline-size/block-size, inset-*, margin/padding/border-inline|block-*) for RTL + writing-mode safety.",
          },
        ],
        "declaration-property-value-disallowed-list": [
          { "text-align": [/^(left|right)$/] },
          { message: "Use text-align: start/end (logical), not left/right." },
        ],
      },
    },
  ],
};
