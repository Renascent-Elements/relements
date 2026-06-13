import { expect, test } from "@playwright/test";

test.describe("segmented control", () => {
  test("clicking an option selects exactly one (native radio)", async ({ page }) => {
    await page.goto("./segmented.html");
    const group = page.getByTestId("basic").locator(".re-segmented");
    const list = group.getByRole("radio", { name: "List" });
    const board = group.getByRole("radio", { name: "Board" });

    await expect(list).toBeChecked();
    await board.click();
    await expect(board).toBeChecked();
    await expect(list).not.toBeChecked();
  });

  test("arrow keys move selection (native radio roving)", async ({ page }) => {
    await page.goto("./segmented.html");
    const group = page.getByTestId("basic").locator(".re-segmented");
    await group.getByRole("radio", { name: "List" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(group.getByRole("radio", { name: "Board" })).toBeChecked();
  });

  test("disabled option is not selectable", async ({ page }) => {
    await page.goto("./segmented.html");
    const month = page.getByTestId("sizes").getByRole("radio", { name: "Month" });
    await expect(month).toBeDisabled();
  });

  test("submits exactly one value as a native radio group", async ({ page }) => {
    await page.goto("./segmented.html");
    // Wrap the live fieldset in a form (moves the node, preserving checked state).
    await page.getByTestId("basic").evaluate((section) => {
      const fs = section.querySelector(".re-segmented")!;
      const form = document.createElement("form");
      fs.parentNode!.insertBefore(form, fs);
      form.appendChild(fs);
    });
    const group = page.getByTestId("basic").locator(".re-segmented");
    await group.getByRole("radio", { name: "Board" }).click();

    const values = await page
      .getByTestId("basic")
      .locator("form")
      .evaluate((form) => {
        const data = new FormData(form as HTMLFormElement);
        return data.getAll("view");
      });
    expect(values).toEqual(["board"]);
  });
});
