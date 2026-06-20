import { expect, test } from "@playwright/test";

test.describe("Multi-select", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./multiselect.html");
  });

  test("checkboxes stay the form value; the summary mirrors the selection", async ({ page }) => {
    const host = page.getByTestId("basic").locator(".re-multiselect");
    // Authored with vue + svelte checked → rendered by enhance on load.
    await expect(host.locator(".re-multiselect__value")).toHaveText("Vue, Svelte");

    await host.locator("summary").click();
    await host.locator('input[value="react"]').check();
    await expect(host.locator(".re-multiselect__value")).toHaveText("React, Vue +1 more");

    const react = host.locator('input[value="react"]');
    expect(await react.getAttribute("name")).toBe("fw");
    expect(await react.isChecked()).toBe(true);
  });

  test("a closed panel keeps its checkboxes out of the tab order (native)", async ({ page }) => {
    const host = page.getByTestId("basic").locator(".re-multiselect");
    await expect(host.locator('input[value="react"]')).toBeHidden(); // closed → not rendered
    await host.locator("summary").click();
    await expect(host.locator('input[value="react"]')).toBeVisible();
  });

  test("Escape closes the panel and returns focus to the summary", async ({ page }) => {
    const host = page.getByTestId("open").locator(".re-multiselect");
    await expect(host).toHaveAttribute("open", ""); // open by default
    await host.locator('input[value="est"]').focus();
    await page.keyboard.press("Escape");
    await expect(host).not.toHaveAttribute("open", "");
    await expect(host.locator("summary")).toBeFocused();
  });

  test("an outside pointerdown closes the open panel", async ({ page }) => {
    const host = page.getByTestId("open").locator(".re-multiselect");
    await expect(host).toHaveAttribute("open", "");
    await page.locator("h1").click(); // outside the control
    await expect(host).not.toHaveAttribute("open", "");
  });

  test("required: an empty submit is blocked, invalidated, and reveals the message", async ({
    page,
  }) => {
    const section = page.getByTestId("required");
    const host = section.locator(".re-multiselect");
    const fieldset = host.locator(".re-multiselect__panel");

    await section.getByRole("button", { name: "Save" }).click();
    await expect(host).toHaveAttribute("data-invalid", ""); // submit was blocked + flagged
    await expect(fieldset).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#diet-error")).toBeVisible();

    await host.locator("summary").click();
    await host.locator('input[value="vegan"]').check();
    await expect(host).not.toHaveAttribute("data-invalid", "");
    await expect(page.locator("#diet-error")).toBeHidden();
  });

  test("a form reset restores the authored placeholder", async ({ page }) => {
    const section = page.getByTestId("required");
    const host = section.locator(".re-multiselect");
    await host.locator("summary").click();
    await host.locator('input[value="vegan"]').check();
    await expect(host.locator(".re-multiselect__value")).toHaveText("Vegan");

    await section.locator("form").evaluate((f) => (f as HTMLFormElement).reset());
    await expect(host.locator(".re-multiselect__value")).toHaveText("Select at least one");
    await expect(host.locator(".re-multiselect__value")).toHaveAttribute("data-placeholder", "");
  });
});
