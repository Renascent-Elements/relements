import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("disclosure page has no detectable a11y violations", async ({ page }) => {
  await page.goto("./disclosure.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
