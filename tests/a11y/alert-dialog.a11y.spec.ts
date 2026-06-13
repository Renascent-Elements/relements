import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("alert-dialog page (closed) has no detectable a11y violations", async ({ page }) => {
  await page.goto("./alert-dialog.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("alert-dialog (open) has no detectable a11y violations", async ({ page }) => {
  await page.goto("./alert-dialog.html");
  await page.getByRole("button", { name: "Delete project" }).click();
  await expect(page.locator("#confirm-delete")).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
