import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("toast page (empty region) has no detectable a11y violations", async ({ page }) => {
  await page.goto("./toast.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("toast page (with toasts) has no detectable a11y violations", async ({ page }) => {
  await page.goto("./toast.html");
  await page.locator("#t-success").click();
  await page.locator("#t-danger").click();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
