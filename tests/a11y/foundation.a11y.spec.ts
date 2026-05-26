import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("foundation page has no detectable a11y violations", async ({ page }) => {
  await page.goto("./foundation.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("examples index has no detectable a11y violations", async ({ page }) => {
  await page.goto("./");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
