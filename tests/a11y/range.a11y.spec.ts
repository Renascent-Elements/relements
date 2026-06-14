import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("range page has no detectable a11y violations", async ({ page }) => {
  await page.goto("./range.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("each thumb is a labelled slider inside a named group", async ({ page }) => {
  await page.goto("./range.html");
  const fs = page.getByTestId("basic").locator(".re-range");
  await expect(fs.locator("legend")).toHaveText(/price range/i);
  const sliders = fs.getByRole("slider");
  await expect(sliders).toHaveCount(2);
  await expect(sliders.first()).toHaveAttribute("aria-label", /minimum/i);
  await expect(sliders.last()).toHaveAttribute("aria-label", /maximum/i);
});
