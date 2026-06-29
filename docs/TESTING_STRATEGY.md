# Testing Strategy

## Purpose

Relements components must be tested in real browsers because the project relies on native HTML, CSS, form behavior, keyboard interaction, `dialog`, custom elements, Shadow DOM, and modern browser APIs.

The goal is not just to prove implementation details. The goal is to prove that each element behaves like a good web citizen across plain HTML, JavaScript enhancement, and framework usage.

## Testing Stack

### Playwright Test

Playwright is the primary test runner.

Use it for:

- Browser behavior tests.
- Keyboard interaction.
- Form behavior.
- Dialog behavior.
- Custom element behavior.
- Cross-browser checks.
- Visual snapshots.
- ARIA snapshots.
- Example-page smoke tests.

Target browsers:

- Chromium.
- Firefox.
- WebKit.

### axe-core With Playwright

Use `@axe-core/playwright` for automated accessibility smoke checks.

Use it for:

- Detecting common accessibility violations.
- Checking examples and element states.
- Preventing obvious regressions.

Do not treat axe results as complete accessibility certification. Manual keyboard and screen reader checks are still required — see [`SCREEN_READER_TESTING.md`](./SCREEN_READER_TESTING.md) for the per-component NVDA/VoiceOver checklist (expected announcements derived from each component's real ARIA).

### Vitest

Use Vitest only for non-browser logic.

Use it for:

- Pure utility functions.
- Token generation logic.
- Package export checks.
- Small parser or transform helpers.

Do not use `jsdom` as the main confidence layer for components. Relements components should be verified in real browsers.

## Test Directory Structure

Target structure:

```txt
tests/
  elements/
    button.spec.ts
    form.spec.ts
    dialog.spec.ts
    disclosure.spec.ts
    tabs.spec.ts
  a11y/
    button.a11y.spec.ts
    form.a11y.spec.ts
    dialog.a11y.spec.ts
  visual/
    button.visual.spec.ts
    form.visual.spec.ts
  unit/
    tokens.spec.ts
    exports.spec.ts
```

## Test Scripts

Target scripts:

```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:browser",
    "test:unit": "vitest run",
    "test:browser": "playwright test",
    "test:a11y": "playwright test tests/a11y",
    "test:visual": "playwright test tests/visual",
    "test:update-snapshots": "playwright test --update-snapshots"
  }
}
```

## Per-Element Test Contract

An element is not complete until it has:

- Plain HTML example.
- CSS-only rendering check if applicable.
- Playwright behavior test.
- Keyboard test if interactive.
- Accessibility smoke test with axe-core.
- Focus visibility check.
- Disabled state check if applicable.
- Invalid/error state check if applicable.
- Visual snapshot for core states.
- Documentation for usage and edge cases.

## Element Test Matrix

| Element    | Browser  | Keyboard | Form           | A11y     | Visual   | Notes                                                             |
| ---------- | -------- | -------- | -------------- | -------- | -------- | ----------------------------------------------------------------- |
| Button     | Required | Required | Required       | Required | Required | Test `button`, `a`, `disabled`, `aria-disabled`, variants.        |
| Link       | Required | Required | Not applicable | Required | Required | Test focus and visited/hover-safe styling where practical.        |
| Input      | Required | Required | Required       | Required | Required | Test label, value, required, invalid, disabled.                   |
| Textarea   | Required | Required | Required       | Required | Required | Test resize and long text.                                        |
| Select     | Required | Required | Required       | Required | Required | Test native option behavior by browser where practical.           |
| Checkbox   | Required | Required | Required       | Required | Required | Test checked, indeterminate if supported, disabled.               |
| Radio      | Required | Required | Required       | Required | Required | Test grouped behavior and arrow key behavior.                     |
| Field      | Required | Required | Required       | Required | Required | Test label, hint, error, `aria-describedby`.                      |
| Disclosure | Required | Required | Not applicable | Required | Required | Test `details` and `summary` without JavaScript.                  |
| Dialog     | Required | Required | Required       | Required | Required | Test `showModal`, close, escape, focus return, `method="dialog"`. |
| Tabs       | Required | Required | Not applicable | Required | Required | Test ARIA roles, arrows, Home/End, selected panel.                |
| `re-tabs`  | Required | Required | Not applicable | Required | Required | Test attributes, events, slots/light DOM, framework usage.        |

## Playwright Test Guidelines

Prefer semantic locators:

```ts
await page.getByRole("button", { name: "Save" }).click();
await expect(page.getByLabel("Email")).toHaveValue("hello@example.com");
```

Avoid testing private DOM details unless the DOM shape is part of the public API.

Use web-first assertions:

```ts
await expect(page.getByRole("dialog")).toBeVisible();
```

Use ARIA snapshots for complex accessible structures:

```ts
await expect(page.getByRole("tablist")).toMatchAriaSnapshot(`
  - tab "Profile" [selected]
  - tab "Security"
`);
```

Use visual snapshots sparingly for stable states:

```ts
await expect(page.getByTestId("button-states")).toHaveScreenshot();
```

## Accessibility Policy

Automated checks must be combined with manual checks.

Manual checks:

- Tab order.
- Focus visibility.
- Keyboard-only operation.
- Browser zoom.
- Reduced motion.
- High contrast / forced colors.
- Screen reader smoke test for form and composite elements.

## CI Policy

Required before merging implementation changes:

- Unit tests pass.
- Playwright Chromium tests pass.
- Accessibility smoke tests pass.

Required before release:

- Chromium, Firefox, and WebKit tests pass.
- Visual snapshots are reviewed.
- Manual accessibility checklist is completed for changed elements.

## Phase Adoption

Phase 0 must install and configure the test stack before the first component is implemented.

Phase 1 must include browser smoke tests for CSS loading and token overrides.

Phase 2 and later must follow the per-element test contract.
