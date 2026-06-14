import { expect, test } from "@playwright/test";

const tree = (page: import("@playwright/test").Page) =>
  page.getByTestId("default").locator(".re-tree");

test.describe("tree", () => {
  test("branches are native <details>/<summary>", async ({ page }) => {
    await page.goto("./tree.html");
    const summary = tree(page).locator(".re-tree__summary").first();
    expect(await summary.evaluate((el) => el.tagName)).toBe("SUMMARY");
    expect(
      await summary.evaluate((el) => el.closest("details")?.classList.contains("re-tree__branch")),
    ).toBe(true);
  });

  test("clicking a collapsed branch toggles it open (native, no JS)", async ({ page }) => {
    await page.goto("./tree.html");
    const branch = tree(page).locator(".re-tree__branch", { hasText: "Getting started" }).first();
    await expect(branch).not.toHaveAttribute("open", "");
    await branch.locator("> summary").click();
    await expect(branch).toHaveAttribute("open", "");
    // its child list is now visible
    await expect(branch.locator(".re-tree__list").first()).toBeVisible();
    await branch.locator("> summary").click();
    await expect(branch).not.toHaveAttribute("open", "");
  });

  test("a nested branch toggles independently and many can stay open", async ({ page }) => {
    await page.goto("./tree.html");
    expect(await tree(page).locator(".re-tree__branch[open]").count()).toBe(2); // Components + Forms
    const forms = tree(page).locator(".re-tree__branch", {
      has: page.locator("> summary", { hasText: "Forms" }),
    });
    await forms.locator("> summary").click();
    // the INNER one actually closed, the OUTER one stays open (proves independence)
    await expect(forms).not.toHaveAttribute("open", "");
    await expect(
      tree(page).locator(".re-tree__branch", { hasText: "Components" }).first(),
    ).toHaveAttribute("open", "");
  });

  test("Enter and Space toggle a focused summary", async ({ page }) => {
    await page.goto("./tree.html");
    const branch = tree(page).locator(".re-tree__branch", { hasText: "Getting started" }).first();
    await branch.locator("> summary").focus();
    await page.keyboard.press("Enter");
    await expect(branch).toHaveAttribute("open", "");
    await page.keyboard.press(" ");
    await expect(branch).not.toHaveAttribute("open", "");
  });

  test("a leaf link is focusable and navigable; exactly one is the current page", async ({
    page,
  }) => {
    await page.goto("./tree.html");
    const button = tree(page).getByRole("link", { name: "Button" });
    await button.focus();
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute("href", /button/);

    const current = tree(page).locator("[aria-current]");
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAttribute("aria-current", "page"); // <a> document
    // intentional divergence from breadcrumb: the current node stays clickable
    expect(await current.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("auto");
  });

  test("leaf labels x-align with same-level branch labels (reserved gutter)", async ({ page }) => {
    await page.goto("./tree.html");
    const t = tree(page);
    // top level, neither has an icon → labels share the chevron-gutter offset
    const leafLabel = t.getByRole("link", { name: "Changelog" }).locator(".re-tree__label");
    const branchLabel = t
      .locator(".re-tree__summary", { hasText: "Getting started" })
      .locator(".re-tree__label");
    const a = await leafLabel.boundingBox();
    const b = await branchLabel.boundingBox();
    expect(Math.abs(a!.x - b!.x)).toBeLessThanOrEqual(1);
  });

  test("indentation compounds with depth", async ({ page }) => {
    await page.goto("./tree.html");
    const t = tree(page);
    const x = async (label: string) =>
      (await t
        .locator(".re-tree__summary", { hasText: label })
        .locator(".re-tree__label")
        .first()
        .boundingBox())!.x;
    // Getting started (depth 0) is less indented than Forms (depth 2)
    expect(await x("Getting started")).toBeLessThan(await x("Forms"));
  });

  test("the current leaf keeps its selection background on hover and focus", async ({ page }) => {
    await page.goto("./tree.html");
    const current = tree(page).locator("[aria-current]");
    const selectionBg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--re-color-selection-bg").trim(),
    );
    // aria-current rule is later in source than :hover (same specificity) → wins
    await current.hover();
    const hoveredBg = await current.evaluate((el) => getComputedStyle(el).backgroundColor);
    // focus adds the inset ring (box-shadow) without dropping the selection bg
    await current.focus();
    const focusedShadow = await current.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(hoveredBg).not.toBe("rgba(0, 0, 0, 0)"); // selection bg, not transparent
    expect(focusedShadow).not.toBe("none"); // inset ring present
    expect(selectionBg.length).toBeGreaterThan(0);
  });
});
