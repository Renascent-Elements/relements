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

// Guards the bg-subtle dark-mode trap: an item hover must stay visible in dark
// (bg-subtle collapses to surface; bg-muted does not).
test.describe("pagination visual — dark hover", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 800 } });
  test("item hover stays visible in dark", async ({ page }) => {
    await page.goto("./pagination.html");
    const region = page.getByTestId("links");
    await region.getByRole("link", { name: "3", exact: true }).hover();
    await expect(region).toHaveScreenshot("pagination-links-hover-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
