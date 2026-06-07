import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

test("pagination links visual snapshot", async ({ page }) => {
  await page.goto("./pagination.html");
  await expect(page.getByTestId("links")).toHaveScreenshot("pagination-links.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("pagination ends visual snapshot", async ({ page }) => {
  await page.goto("./pagination.html");
  await expect(page.getByTestId("ends")).toHaveScreenshot("pagination-ends.png", {
    maxDiffPixelRatio: 0.01,
  });
});
