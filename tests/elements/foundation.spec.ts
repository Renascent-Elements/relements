import { expect, test } from "@playwright/test";

test.describe("Foundation: CSS loading and tokens", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./foundation.html");
  });

  test("loads the foundation page", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: "Foundation" })).toBeVisible();
  });

  test("registers the re-* cascade layers", async ({ page }) => {
    const layerCount = await page.evaluate(() => {
      const seen = new Set<string>();
      for (const sheet of Array.from(document.styleSheets)) {
        let rules: CSSRuleList;
        try {
          rules = sheet.cssRules;
        } catch {
          continue;
        }
        for (const rule of Array.from(rules)) {
          // @ts-expect-error -- CSSLayerStatementRule / CSSLayerBlockRule
          if (rule.name && typeof rule.name === "string") seen.add(rule.name);
          // CSSLayerStatementRule.nameList
          // @ts-expect-error
          if (rule.nameList) for (const n of rule.nameList) seen.add(n);
        }
      }
      return Array.from(seen);
    });
    expect(layerCount).toEqual(expect.arrayContaining(["re.tokens", "re.reset", "re.base"]));
  });

  test("resolves design tokens on :root", async ({ page }) => {
    const computed = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      return {
        bg: root.getPropertyValue("--re-color-bg").trim(),
        text: root.getPropertyValue("--re-color-text").trim(),
        sansFont: root.getPropertyValue("--re-font-sans").trim(),
        spaceMd: root.getPropertyValue("--re-space-4").trim(),
        radiusMd: root.getPropertyValue("--re-radius-md").trim(),
      };
    });
    expect(computed.bg).not.toBe("");
    expect(computed.text).not.toBe("");
    expect(computed.sansFont).toMatch(/system-ui|sans-serif/);
    expect(computed.spaceMd).toBe("1rem");
    expect(computed.radiusMd).toBe("0.375rem");
  });

  test("subtree theming overrides tokens locally", async ({ page }) => {
    const { bodyBg, themedBg } = await page.evaluate(() => {
      const body = getComputedStyle(document.body);
      const themed = getComputedStyle(document.querySelector(".themed")!);
      return {
        bodyBg: body.backgroundColor,
        themedBg: themed.backgroundColor,
      };
    });
    expect(themedBg).not.toBe(bodyBg);
  });

  test("applies the focus ring on tab into a link", async ({ page }) => {
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBe("A");
    const boxShadow = await page.evaluate(
      () => getComputedStyle(document.activeElement as Element).boxShadow,
    );
    expect(boxShadow).not.toBe("none");
  });
});
