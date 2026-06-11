import { expect, test } from "@playwright/test";

test.describe("combobox", () => {
  test("shows the chevron at rest and yields it while focused", async ({ page }) => {
    await page.goto("./combobox.html");
    const input = page.getByTestId("basic").getByRole("combobox");

    const bg = () => input.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(await bg()).toContain("linear-gradient");

    await input.focus();
    expect(await bg()).toBe("none");

    await input.blur();
    expect(await bg()).toContain("linear-gradient");
  });
});
