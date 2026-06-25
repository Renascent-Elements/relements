import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("toggle-group page has no detectable a11y violations", async ({ page }) => {
  await page.goto("./toggle-group.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("each group is a named fieldset", async ({ page }) => {
  await page.goto("./toggle-group.html");
  const groups = page.locator(".re-toggle-group");
  const count = await groups.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    await expect(groups.nth(i)).toHaveAttribute("aria-label", /.+/);
  }
});

test("icon-only toggles are named, and the glyphs are decorative", async ({ page }) => {
  await page.goto("./toggle-group.html");
  const group = page.getByTestId("icons").locator(".re-toggle-group");
  const inputs = group.locator("input");
  const count = await inputs.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    // No visible text, so the accessible name must come from aria-label.
    await expect(inputs.nth(i)).toHaveAttribute("aria-label", /align/i);
  }
  for (const hidden of await group
    .locator("svg")
    .evaluateAll((els) => els.map((el) => el.getAttribute("aria-hidden")))) {
    expect(hidden).toBe("true");
  }
});
