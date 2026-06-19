import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

for (const region of ["basic", "sizes", "states"] as const) {
  test(`file ${region} visual snapshot`, async ({ page }) => {
    await page.goto("./file.html");
    await expect(page.getByTestId(region)).toHaveScreenshot(`file-${region}.png`, {
      maxDiffPixelRatio: 0.01,
    });
  });
}

test.describe("file visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 800 } });
  test("file input stays legible in dark", async ({ page }) => {
    await page.goto("./file.html");
    await expect(page.getByTestId("basic")).toHaveScreenshot("file-basic-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
