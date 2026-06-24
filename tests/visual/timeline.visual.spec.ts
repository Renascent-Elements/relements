import { expect, test } from "@playwright/test";

test.describe("timeline visual", () => {
  test.use({ colorScheme: "light", viewport: { width: 1024, height: 900 } });

  test("basic + current", async ({ page }) => {
    await page.goto("./timeline.html");
    await expect(page.getByTestId("basic")).toHaveScreenshot("timeline-basic.png", {
      maxDiffPixelRatio: 0.01,
    });
    await expect(page.getByTestId("current")).toHaveScreenshot("timeline-current.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("compact", async ({ page }) => {
    await page.goto("./timeline.html");
    await expect(page.getByTestId("compact")).toHaveScreenshot("timeline-compact.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("timeline visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 900 } });

  test("basic (dark)", async ({ page }) => {
    await page.goto("./timeline.html");
    await expect(page.getByTestId("basic")).toHaveScreenshot("timeline-basic-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
