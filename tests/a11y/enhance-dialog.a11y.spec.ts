import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("enhance-dialog page has no detectable a11y violations", async ({ page }) => {
  await page.goto("./enhance-dialog.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("enhance-dialog with dialog open has no detectable a11y violations", async ({ page }) => {
  await page.goto("./enhance-dialog.html");
  await page.locator("#ed-open").click();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
