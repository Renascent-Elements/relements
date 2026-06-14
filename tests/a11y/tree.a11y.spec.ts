import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("tree page has no detectable a11y violations", async ({ page }) => {
  await page.goto("./tree.html");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("the tree is a named navigation landmark", async ({ page }) => {
  await page.goto("./tree.html");
  const nav = page.getByTestId("default").locator(".re-tree");
  expect(await nav.evaluate((el) => el.tagName)).toBe("NAV");
  await expect(nav).toHaveAttribute("aria-label", /.+/);
});

test("honesty guard: no role=tree/treeitem; role=list on every list", async ({ page }) => {
  await page.goto("./tree.html");
  const tree = page.getByTestId("default").locator(".re-tree");
  const noTreeRoles = await tree.evaluate((root) =>
    [root, ...root.querySelectorAll(".re-tree__branch, .re-tree__summary, .re-tree__leaf")].every(
      (el) => el.getAttribute("role") === null,
    ),
  );
  expect(noTreeRoles).toBe(true);
  // count-based (not vacuous: every() is true on an empty array) + role check
  await expect(tree.locator("ul")).toHaveCount(4); // default demo has 4 lists
  await expect(tree.locator('ul[role="list"]')).toHaveCount(4);
});
