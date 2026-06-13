import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("tags-input page has no detectable a11y violations", async ({ page }) => {
  await page.goto("./tags-input.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("tags-input at the max (invalid) + after a removal has no a11y violations", async ({
  page,
}) => {
  await page.goto("./tags-input.html");
  const ed = page.getByTestId("max").locator(".re-tags-input__field");
  await ed.click();
  await ed.fill("js");
  await ed.press("Enter"); // hits max → [data-invalid]
  await ed.fill("go");
  await ed.press("Enter"); // rejected
  await page.getByTestId("basic").locator("[data-re-tags-remove]").first().click();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
