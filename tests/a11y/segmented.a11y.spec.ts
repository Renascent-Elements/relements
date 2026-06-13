import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("segmented page has no detectable a11y violations", async ({ page }) => {
  await page.goto("./segmented.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
