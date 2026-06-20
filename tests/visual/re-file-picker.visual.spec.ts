import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 700 } });

test("re-file-picker basic visual snapshot", async ({ page }) => {
  await page.goto("./re-file-picker.html");
  await expect(page.getByTestId("basic")).toHaveScreenshot("re-file-picker-basic.png", {
    maxDiffPixelRatio: 0.01,
  });
});
