import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("dialog page (closed) has no detectable a11y violations", async ({ page }) => {
  await page.goto("./dialog.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("modal dialog (open) has no detectable a11y violations", async ({ page }) => {
  await page.goto("./dialog.html");
  await page.locator("#open-modal").click();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
