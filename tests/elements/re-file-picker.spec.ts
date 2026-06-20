import { expect, test } from "@playwright/test";

const PDF = { name: "doc.pdf", mimeType: "application/pdf", buffer: Buffer.from("pdf") };

test.describe("<re-file-picker>", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./re-file-picker.html");
  });

  test("upgrades and reflects attributes onto the input", async ({ page }) => {
    const el = page.locator("re-file-picker");
    await expect(el).toHaveClass(/re-file-picker/);
    const input = el.locator(".re-file-picker__input");
    // name + multiple are reflected from the host onto the form-value input.
    expect(await input.getAttribute("name")).toBe("docs");
    expect(await input.evaluate((i: HTMLInputElement) => i.multiple)).toBe(true);
  });

  test(".files reads the selection and .clear() empties it", async ({ page }) => {
    const el = page.locator("re-file-picker");
    await el.locator(".re-file-picker__input").setInputFiles(PDF);
    expect(await el.evaluate((node: HTMLElement & { files: File[] }) => node.files.length)).toBe(1);
    expect(await el.evaluate((node: HTMLElement & { files: File[] }) => node.files[0].name)).toBe(
      "doc.pdf",
    );
    await el.evaluate((node: HTMLElement & { clear: () => void }) => node.clear());
    expect(await el.evaluate((node: HTMLElement & { files: File[] }) => node.files.length)).toBe(0);
  });

  test("a drop on the element updates the readout (re-error stays quiet when valid)", async ({
    page,
  }) => {
    const el = page.locator("re-file-picker");
    await el.evaluate((node) => {
      (window as unknown as { _err: unknown })._err = null;
      node.addEventListener("re-error", (e) => {
        (window as unknown as { _err: unknown })._err = (e as CustomEvent).detail;
      });
    });
    const dt = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add(new File(["x"], "a.png", { type: "image/png" }));
      return dt;
    });
    await el.dispatchEvent("drop", { dataTransfer: dt });
    await expect(el.locator(".re-file-picker__list")).toHaveText("a.png");
    // No accept/max constraints on this picker → a valid drop must not error.
    expect(await page.evaluate(() => (window as unknown as { _err: unknown })._err)).toBeNull();
  });
});
