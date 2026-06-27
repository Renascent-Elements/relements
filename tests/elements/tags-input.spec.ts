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

  test("commit and removal fire re-tags-change with the current values", async ({ page }) => {
    await page.goto("./tags-input.html");
    const events = await page.evaluate(() => {
      const log: string[][] = [];
      const group = document.querySelector('[data-testid="basic"] .re-tags-input')!;
      group.addEventListener("re-tags-change", (e) =>
        log.push((e as CustomEvent).detail.values.slice()),
      );
      (window as never as { __log: string[][] }).__log = log;
      return log;
    });
    expect(events).toEqual([]); // seeding does NOT fire
    const ed = editor(page, "basic");
    await ed.click();
    await ed.fill("ops");
    await ed.press("Enter");
    await page.getByTestId("basic").locator("[data-re-tags-remove]").first().click();
    const log = await page.evaluate(() => (window as never as { __log: string[][] }).__log);
    expect(log).toEqual([
      ["design", "engineering", "ops"], // commit → full array
      ["engineering", "ops"], // remove → reduced array
    ]);
  });

  test("a multi-delimiter paste commits each token and keeps the remainder", async ({ page }) => {
    await page.goto("./tags-input.html");
    const ed = editor(page, "basic");
    await ed.click();
    // Set the value + one input event, mirroring a paste of "qa, ops, dev".
    await ed.evaluate((el: HTMLInputElement) => {
      el.value = "qa, ops, dev";
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(await hiddenValues(page, "basic")).toEqual(["design", "engineering", "qa", "ops"]);
    await expect(ed).toHaveValue("dev"); // trailing token stays in the editor
  });

  test("re-enhancing is idempotent", async ({ page }) => {
    await page.goto("./tags-input.html");
    await page.evaluate(async () => {
      const { enhanceTagsInput } = await import("/packages/core/src/behaviors/tags-input.js");
      enhanceTagsInput(document);
    });
    expect(await hiddenValues(page, "basic")).toEqual(["design", "engineering"]);
    await expect(page.getByTestId("basic").locator(".re-tags-input")).toHaveCount(1);
  });

  test("destroy() round-trips the CURRENT tokens back into a plain input", async ({ page }) => {
    await page.goto("./tags-input.html");
    const ed = editor(page, "basic");
    await ed.click();
    await ed.fill("ops");
    await ed.press("Enter");
    await page.getByTestId("basic").locator("[data-re-tags-remove]").first().click(); // remove design
    const restored = await page.evaluate(() => {
      (window as never as { __reController: { destroy(): void } }).__reController.destroy();
      const input = document.getElementById("tags-basic") as HTMLInputElement;
      return {
        name: input.getAttribute("name"),
        value: input.value,
        cls: input.className,
        groups: document.querySelectorAll('[data-testid="basic"] .re-tags-input').length,
        chips: document.querySelectorAll('[data-testid="basic"] [data-re-tags-chip]').length,
      };
    });
    expect(restored.name).toBe("tags");
    expect(restored.value).toBe("engineering, ops"); // current tokens, not the seed
    expect(restored.cls).toContain("re-input");
    expect(restored.groups).toBe(0);
    expect(restored.chips).toBe(0);
  });

  test("a rejected duplicate is announced (not silent)", async ({ page }) => {
    await page.goto("./tags-input.html");
    const ed = editor(page, "basic");
    const live = page.getByTestId("basic").locator(".re-tags-input [aria-live]");
    await ed.click();
    await ed.fill("Design"); // already present (case-insensitive)
    await ed.press("Enter");
    await expect(live).toHaveText(/already added/i);
    expect(await hiddenValues(page, "basic")).toEqual(["design", "engineering"]); // unchanged
  });

  test("the editor is described by the field hint", async ({ page }) => {
    await page.goto("./tags-input.html");
    const describedby = await editor(page, "basic").getAttribute("aria-describedby");
    expect(describedby).toBeTruthy();
    await expect(page.locator(`#${describedby}`)).toHaveText(/Enter or comma/i);
  });

  test("chips form a reviewable list (role=list / listitem)", async ({ page }) => {
    await page.goto("./tags-input.html");
    const group = page.getByTestId("basic").locator(".re-tags-input");
    await expect(group.locator("[role=list]")).toHaveCount(1);
    await expect(group.locator("[role=listitem]")).toHaveCount(2); // seeded design + engineering
    const ed = editor(page, "basic");
    await ed.click();
    await ed.fill("ops");
    await ed.press("Enter");
    await expect(group.locator("[role=listitem]")).toHaveCount(3);
  });

  // ---- Container mode (the framework-safe, no-reparent path) ----------------
  test("container mode adopts the container WITHOUT moving the input", async ({ page }) => {
    await page.goto("./tags-input.html");
    const section = page.getByTestId("container");
    const container = section.locator("[data-re-tags-input]");
    // The author's container becomes the group; the editor is still its child.
    await expect(container).toHaveClass(/re-tags-input/);
    await expect(container).toHaveAttribute("role", "group");
    await expect(container).toHaveAttribute("aria-labelledby", /.+/); // labelled from .re-field
    // The crux: the input was NOT reparented into a behavior-created wrapper — its
    // parent is still the author's marked container (input mode would be false).
    const parentIsMarkedContainer = await section
      .locator("#tags-container")
      .evaluate((el) => el.parentElement?.hasAttribute("data-re-tags-input") ?? false);
    expect(parentIsMarkedContainer).toBe(true);
    expect(await hiddenValues(page, "container")).toEqual(["design", "eng"]);
    await expect(section.locator("#tags-container")).not.toHaveAttribute("name", /.*/);
  });

  test("container mode: commit + remove behave exactly like input mode", async ({ page }) => {
    await page.goto("./tags-input.html");
    const ed = editor(page, "container");
    await ed.click();
    await ed.fill("ops");
    await ed.press("Enter");
    expect(await hiddenValues(page, "container")).toEqual(["design", "eng", "ops"]);
    await page.getByTestId("container").locator("[data-re-tags-remove]").first().click();
    expect(await hiddenValues(page, "container")).toEqual(["eng", "ops"]);
  });

  test("container mode survives a framework-style sibling mutation at the input's slot", async ({
    page,
  }) => {
    await page.goto("./tags-input.html");
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    // Mimic a vdom re-render inserting then removing a sibling next to the input
    // inside the container — the #114 crash shape, but valid here because the
    // input was never moved out of the container.
    await page
      .getByTestId("container")
      .locator("[data-re-tags-input]")
      .evaluate((container) => {
        const input = container.querySelector("input:not([type=hidden])");
        const sib = document.createElement("span");
        container.insertBefore(sib, input); // input IS a child → no throw
        sib.remove();
      });
    const ed = editor(page, "container");
    await ed.click();
    await ed.fill("qa");
    await ed.press("Enter");
    expect(await hiddenValues(page, "container")).toEqual(["design", "eng", "qa"]);
    expect(errors).toEqual([]);
  });
});
