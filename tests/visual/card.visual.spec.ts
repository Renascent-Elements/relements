import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("card visual snapshot", async ({ page }) => {
  await page.goto("./card.html");
  const card = page.getByTestId("card");
  await expect(card).toHaveScreenshot("card.png", {
    maxDiffPixelRatio: 0.01,
  });
});
