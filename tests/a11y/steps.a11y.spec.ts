import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("steps page has no detectable a11y violations", async ({ page }) => {
  await page.goto("./steps.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("honesty guard: ordered semantics kept, markers decorative, not a tablist", async ({
  page,
}) => {
  await page.goto("./steps.html");
  const ol = page.getByTestId("vertical").locator(".re-steps");

  // ordered semantics survive: it is an <ol> and is NOT downgraded to role=list
  expect(await ol.evaluate((el) => el.tagName)).toBe("OL");
  await expect(ol).not.toHaveAttribute("role", "list");

  // markers are decorative — count-based (non-vacuous): every marker is hidden
  const markers = ol.locator(".re-steps__marker");
  const hidden = ol.locator('.re-steps__marker[aria-hidden="true"]');
  const total = await markers.count();
  expect(total).toBeGreaterThan(0);
  await expect(hidden).toHaveCount(total);

  // not an ARIA tab widget
  await expect(page.locator('[role="tab"], [role="tablist"]')).toHaveCount(0);

  // exactly one current step, addressed with the correct token
  const current = ol.locator("[aria-current]");
  await expect(current).toHaveCount(1);
  await expect(current).toHaveAttribute("aria-current", "step");
});
