import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("popover page (closed) has no detectable a11y violations", async ({ page }) => {
  await page.goto("./popover.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("popover page (open) has no detectable a11y violations", async ({ page }) => {
  await page.goto("./popover.html");
  await page.locator("#pop-1-btn").click();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
