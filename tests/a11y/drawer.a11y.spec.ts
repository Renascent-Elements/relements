import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("drawer page (closed) has no detectable a11y violations", async ({ page }) => {
  await page.goto("./drawer.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("drawer (open) has no detectable a11y violations", async ({ page }) => {
  await page.goto("./drawer.html");
  await page.getByRole("button", { name: "End", exact: true }).click();
  await expect(page.locator("#drawer-end")).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
