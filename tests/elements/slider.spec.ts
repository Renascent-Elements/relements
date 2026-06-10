import { expect, test } from "@playwright/test";

test.describe("slider", () => {
  test("keeps native keyboard interaction with .re-slider applied", async ({ page }) => {
    await page.goto("./slider.html");
    const slider = page.getByTestId("basic").getByRole("slider");
    await expect(slider).toHaveValue("50");

    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await expect(slider).toHaveValue("51");
    await page.keyboard.press("End");
    await expect(slider).toHaveValue("100");
  });

  test("disabled slider is not focusable", async ({ page }) => {
    await page.goto("./slider.html");
    const slider = page.getByTestId("states").getByRole("slider");
    await expect(slider).toBeDisabled();
  });
});
