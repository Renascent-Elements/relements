import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

for (const region of ["basic", "field", "sizes"] as const) {
  test(`color ${region} visual snapshot`, async ({ page }) => {
    await page.goto("./color.html");
    await expect(page.getByTestId(region)).toHaveScreenshot(`color-${region}.png`, {
      maxDiffPixelRatio: 0.01,
    });
  });
}

test.describe("color visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 800 } });
  test("color swatch frame in dark", async ({ page }) => {
    await page.goto("./color.html");
    await expect(page.getByTestId("basic")).toHaveScreenshot("color-basic-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
