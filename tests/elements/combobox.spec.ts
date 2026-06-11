import { expect, test } from "@playwright/test";

test.describe("combobox", () => {
  test("keeps the select-style chevron at rest and while focused", async ({ page }) => {
    await page.goto("./combobox.html");
    const input = page.getByTestId("basic").getByRole("combobox");

    const bg = () => input.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(await bg()).toContain("linear-gradient");

    await input.focus();
    expect(await bg()).toContain("linear-gradient");
  });
});
