import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("combobox page has no detectable a11y violations", async ({ page }) => {
  await page.goto("./combobox.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("enhanced combobox with the list open has no detectable a11y violations", async ({ page }) => {
  await page.goto("./combobox.html");
  const input = page.getByTestId("enhanced").getByRole("combobox");
  await input.click();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator(".re-combobox__list")).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
