import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", viewport: { width: 1024, height: 900 } });

test("otp basic (filled) visual snapshot", async ({ page }) => {
  await page.goto("./otp.html");
  await page.getByTestId("basic").locator(".re-otp").fill("123456");
  await expect(page.getByTestId("basic")).toHaveScreenshot("otp-basic.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("otp lengths & sizes visual snapshot", async ({ page }) => {
  await page.goto("./otp.html");
  await expect(page.getByTestId("length")).toHaveScreenshot("otp-length.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("otp states visual snapshot", async ({ page }) => {
  await page.goto("./otp.html");
  await expect(page.getByTestId("states")).toHaveScreenshot("otp-states.png", {
    maxDiffPixelRatio: 0.01,
  });
});
