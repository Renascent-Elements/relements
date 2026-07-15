import { expect, test } from "@playwright/test";

test.describe("choice card visual", () => {
  test.use({ colorScheme: "light", viewport: { width: 1024, height: 900 } });

  test("basic + horizontal", async ({ page }) => {
    await page.goto("./choice.html");
    await expect(page.getByTestId("basic")).toHaveScreenshot("choice-basic.png", {
      maxDiffPixelRatio: 0.01,
    });
    await expect(page.getByTestId("horizontal")).toHaveScreenshot("choice-horizontal.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("disabled", async ({ page }) => {
    await page.goto("./choice.html");
    await expect(page.getByTestId("disabled")).toHaveScreenshot("choice-disabled.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("choice card visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 900 } });

  test("basic (dark)", async ({ page }) => {
    await page.goto("./choice.html");
    await expect(page.getByTestId("basic")).toHaveScreenshot("choice-basic-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("hovered unchecked card (dark) — hover cue must not vanish on dark", async ({ page }) => {
    await page.goto("./choice.html");
    const card = page.getByTestId("basic").locator(".re-choice").nth(1);
    await card.hover();
    await expect(page.getByTestId("basic")).toHaveScreenshot("choice-hover-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
