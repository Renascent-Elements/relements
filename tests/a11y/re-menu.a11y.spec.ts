import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("re-menu page (closed) has no detectable a11y violations", async ({ page }) => {
  await page.goto("./re-menu.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("re-menu page (open) has no detectable a11y violations", async ({ page }) => {
  await page.goto("./re-menu.html");
  await page.locator("#rm-1-btn").click();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
