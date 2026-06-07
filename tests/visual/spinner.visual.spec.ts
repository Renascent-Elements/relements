import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("spinner sizes visual snapshot", async ({ page }) => {
  await page.goto("./spinner.html");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.getByTestId("sizes")).toHaveScreenshot("spinner-sizes.png", {
    maxDiffPixelRatio: 0.01,
  });
});
