import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("menu-button page (closed) has no detectable a11y violations", async ({ page }) => {
  await page.goto("./menu-button.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("menu-button page (open) has no detectable a11y violations", async ({ page }) => {
  await page.goto("./menu-button.html");
  await page.locator("#mb-1-btn").click();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
