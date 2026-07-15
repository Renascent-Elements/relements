import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("prose page has no detectable a11y violations", async ({ page }) => {
  await page.goto("./prose.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("prose styles classless markup without changing its semantics", async ({ page }) => {
  await page.goto("./prose.html");
  // The whole point: rendered markdown keeps its native roles — nothing in
  // prose.css adds ARIA or swallows structure.
  const basic = page.getByTestId("basic").locator(".re-prose");
  await expect(basic.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(basic.getByRole("list").first()).toBeVisible();
  await expect(basic.getByRole("listitem").first()).toBeVisible();
  await expect(page.getByTestId("code-table").getByRole("table")).toBeVisible();
  await expect(page.getByTestId("quote-figure").getByRole("blockquote")).toBeVisible();
});
