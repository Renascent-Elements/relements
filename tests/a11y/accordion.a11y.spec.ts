import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("accordion page has no detectable a11y violations", async ({ page }) => {
  await page.goto("./accordion.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("accordion page has no a11y violations with a panel expanded", async ({ page }) => {
  await page.goto("./accordion.html");
  const panel = page.locator(".re-disclosure").nth(1);
  await panel.locator(".re-disclosure__summary").click();
  await expect(panel).toHaveAttribute("open", "");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
