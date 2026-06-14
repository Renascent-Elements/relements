import { expect, test } from "@playwright/test";

test.describe("button-group visual", () => {
  test.use({ colorScheme: "light", viewport: { width: 1024, height: 800 } });

  test("horizontal", async ({ page }) => {
    await page.goto("./button-group.html");
    await expect(page.getByTestId("basic")).toHaveScreenshot("button-group-basic.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("vertical", async ({ page }) => {
    await page.goto("./button-group.html");
    await expect(page.getByTestId("orientation")).toHaveScreenshot("button-group-vertical.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("link members (incl. aria-disabled)", async ({ page }) => {
    await page.goto("./button-group.html");
    await expect(page.getByTestId("links")).toHaveScreenshot("button-group-links.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("focused middle member — ring not occluded (light)", async ({ page }) => {
    await page.goto("./button-group.html");
    await page.getByTestId("basic").locator(".re-button").nth(1).focus();
    await expect(page.getByTestId("basic")).toHaveScreenshot("button-group-focus-light.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("button-group visual — dark", () => {
  test.use({ colorScheme: "dark", viewport: { width: 1024, height: 800 } });

  test("focused middle member — ring not occluded (dark)", async ({ page }) => {
    await page.goto("./button-group.html");
    await page.getByTestId("basic").locator(".re-button").nth(1).focus();
    await expect(page.getByTestId("basic")).toHaveScreenshot("button-group-focus-dark.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
