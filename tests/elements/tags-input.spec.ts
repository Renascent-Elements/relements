import { expect, test } from "@playwright/test";

const editor = (page: import("@playwright/test").Page, testid: string) =>
  page.getByTestId(testid).locator(".re-tags-input__field");
const hiddenValues = async (page: import("@playwright/test").Page, testid: string) =>
  page
    .getByTestId(testid)
    .locator("input[type=hidden]")
    .evaluateAll((els) => els.map((e) => (e as HTMLInputElement).value));

test.describe("tags input", () => {
  test("enhances into a labelled group with hidden inputs; editor is unnamed", async ({ page }) => {
    await page.goto("./tags-input.html");
    const group = page.getByTestId("basic").locator(".re-tags-input");
    await expect(group).toHaveAttribute("role", "group");
    await expect(group).toHaveAttribute("aria-labelledby", /.+/);
    expect(await hiddenValues(page, "basic")).toEqual(["design", "engineering"]);
    await expect(editor(page, "basic")).not.toHaveAttribute("name", /.*/);
  });

  test("Enter and comma commit tags; duplicates are rejected case-insensitively", async ({
    page,
  }) => {
    await page.goto("./tags-input.html");
    const ed = editor(page, "basic");
    await ed.click();
    await ed.fill("ops");
    await ed.press("Enter");
    expect(await hiddenValues(page, "basic")).toEqual(["design", "engineering", "ops"]);
    await ed.pressSequentially("qa,");
    expect(await hiddenValues(page, "basic")).toEqual(["design", "engineering", "ops", "qa"]);
    await ed.fill("Design");
    await ed.press("Enter");
    expect(await hiddenValues(page, "basic")).toEqual(["design", "engineering", "ops", "qa"]);
  });

  test("× removes a chip and Backspace on empty removes the last", async ({ page }) => {
    await page.goto("./tags-input.html");
    const group = page.getByTestId("basic").locator(".re-tags-input");
    await group.locator("[data-re-tags-chip] .re-tag__remove").first().click();
    expect(await hiddenValues(page, "basic")).toEqual(["engineering"]);
    const ed = editor(page, "basic");
    await ed.click();
    await ed.press("Backspace");
    expect(await hiddenValues(page, "basic")).toEqual([]);
  });

  test("enforces max and marks invalid", async ({ page }) => {
    await page.goto("./tags-input.html");
    const ed = editor(page, "max");
    await ed.click();
    await ed.fill("js");
    await ed.press("Enter"); // 3rd → at max
    await ed.fill("go");
    await ed.press("Enter"); // rejected
    expect(await hiddenValues(page, "max")).toEqual(["html", "css", "js"]);
    await expect(page.getByTestId("max").locator(".re-tags-input")).toHaveAttribute(
      "data-invalid",
      "",
    );
  });

  test("submits an array; the editor contributes nothing", async ({ page }) => {
    await page.goto("./tags-input.html");
    const values = await page
      .getByTestId("form")
      .locator("form")
      .evaluate((form) => {
        const fd = new FormData(form as HTMLFormElement);
        return { labels: fd.getAll("labels"), keys: [...fd.keys()] };
      });
    expect(values.labels).toEqual(["bug", "docs"]);
    expect(values.keys).toEqual(["labels", "labels"]); // no stray editor field
  });

  test("the enhanced subtree has no label with multiple labelable descendants", async ({
    page,
  }) => {
    await page.goto("./tags-input.html");
    const bad = await page.getByTestId("basic").evaluate((root) => {
      const labelables = "button, input, select, textarea, meter, output, progress";
      return [...root.querySelectorAll("label")].some(
        (l) => l.querySelectorAll(labelables).length > 1,
      );
    });
    expect(bad).toBe(false);
  });

  test("base degrades to a plain comma-separated input with no JS", async ({ page }) => {
    // Strip the enhancer marker before scripts run to simulate no-JS.
    await page.goto("./tags-input.html");
    const restored = await page.evaluate(() => {
      (window as never as { __reController: { destroy(): void } }).__reController.destroy();
      const input = document.getElementById("tags-basic") as HTMLInputElement;
      return { name: input.getAttribute("name"), value: input.value, cls: input.className };
    });
    expect(restored.name).toBe("tags");
    expect(restored.value).toBe("design, engineering");
    expect(restored.cls).toContain("re-input");
  });
});
