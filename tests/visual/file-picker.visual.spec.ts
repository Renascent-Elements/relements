import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 900 } });

for (const region of ["basic", "sizes", "states"] as const) {
  test(`file-picker ${region} visual snapshot`, async ({ page }) => {
    await page.goto("./file-picker.html");
    await expect(page.getByTestId(region)).toHaveScreenshot(`file-picker-${region}.png`, {
      maxDiffPixelRatio: 0.01,
    });
  });
}

test.describe("file-picker visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 900 } });
  test("file picker in dark", async ({ page }) => {
    await page.goto("./file-picker.html");
    await expect(page.getByTestId("basic")).toHaveScreenshot("file-picker-basic-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
