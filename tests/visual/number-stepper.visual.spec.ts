import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("number-stepper visual snapshot", async ({ page }) => {
  await page.goto("./number-stepper.html");
  await expect(page.getByTestId("basic")).toHaveScreenshot("number-stepper-basic.png", {
    maxDiffPixelRatio: 0.01,
  });
});
