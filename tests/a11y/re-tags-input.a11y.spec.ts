import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("re-tags-input page has no detectable a11y violations", async ({ page }) => {
  await page.goto("./re-tags-input.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("the enhanced element exposes a NAMED group (axe parks an unnamed group in incomplete)", async ({
  page,
}) => {
  await page.goto("./re-tags-input.html");
  // axe won't flag an unnamed role=group as a violation, so assert the computed
  // accessible name directly via the role — the element has no <label>, so its
  // aria-labelledby is the only source of the group's name.
  await expect(
    page.getByTestId("basic").getByRole("group", { name: "Project tags" }),
  ).toBeVisible();
});
