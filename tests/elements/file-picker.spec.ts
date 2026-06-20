import { expect, test } from "@playwright/test";

const PDF = { name: "doc.pdf", mimeType: "application/pdf", buffer: Buffer.from("pdf") };

/** Build a DataTransfer with the given files and drop it on the host. */
async function drop(
  host: import("@playwright/test").Locator,
  files: { name: string; type: string }[],
) {
  const page = host.page();
  const dt = await page.evaluateHandle((files) => {
    const dt = new DataTransfer();
    for (const f of files) dt.items.add(new File(["x"], f.name, { type: f.type }));
    return dt;
  }, files);
  await host.dispatchEvent("dragover", { dataTransfer: dt });
  await host.dispatchEvent("drop", { dataTransfer: dt });
}

test.describe("File picker", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./file-picker.html");
  });

  test("native pick echoes the filename and reveals clear", async ({ page }) => {
    const host = page.getByTestId("basic").locator(".re-file-picker");
    await host.locator(".re-file-picker__input").setInputFiles(PDF);
    await expect(host).toHaveAttribute("data-has-files", "");
    await expect(host.locator(".re-file-picker__list")).toHaveText("doc.pdf");
    await expect(host.locator(".re-file-picker__clear")).toBeVisible();
    await expect(host.locator(".re-file-picker__status")).toHaveText(/doc\.pdf selected/);
  });

  test("the native input keeps its name (stays the form value)", async ({ page }) => {
    const input = page.getByTestId("basic").locator(".re-file-picker__input");
    await input.setInputFiles(PDF);
    expect(await input.getAttribute("name")).toBe("docs");
    expect(await input.evaluate((el: HTMLInputElement) => el.files?.length)).toBe(1);
  });

  test("drop sets the files and updates the readout", async ({ page }) => {
    const host = page.getByTestId("basic").locator(".re-file-picker");
    await drop(host, [{ name: "a.png", type: "image/png" }]);
    await expect(host).toHaveAttribute("data-has-files", "");
    await expect(host.locator(".re-file-picker__list")).toHaveText("a.png");
  });

  test("a second drop replaces the selection", async ({ page }) => {
    const host = page.getByTestId("basic").locator(".re-file-picker");
    await drop(host, [{ name: "a.png", type: "image/png" }]);
    await drop(host, [{ name: "b.png", type: "image/png" }]);
    await expect(host.locator(".re-file-picker__list")).toHaveText("b.png");
    expect(
      await host
        .locator(".re-file-picker__input")
        .evaluate((el: HTMLInputElement) => el.files?.length),
    ).toBe(1);
  });

  test("clear empties the selection and hides the readout", async ({ page }) => {
    const host = page.getByTestId("basic").locator(".re-file-picker");
    await host.locator(".re-file-picker__input").setInputFiles(PDF);
    await host.locator(".re-file-picker__clear").click();
    await expect(host).not.toHaveAttribute("data-has-files", "");
    await expect(host.locator(".re-file-picker__list")).toBeHidden();
    expect(
      await host
        .locator(".re-file-picker__input")
        .evaluate((el: HTMLInputElement) => el.files?.length),
    ).toBe(0);
  });

  test("validation: too many files keeps the limit and emits re-error", async ({ page }) => {
    const host = page.getByTestId("validation").locator(".re-file-picker");
    await host.evaluate((el) => {
      (window as unknown as { _err: unknown })._err = null;
      el.addEventListener("re-error", (e) => {
        (window as unknown as { _err: unknown })._err = (e as CustomEvent).detail;
      });
    });
    await drop(host, [
      { name: "a.png", type: "image/png" },
      { name: "b.png", type: "image/png" },
    ]);
    expect(
      await host
        .locator(".re-file-picker__input")
        .evaluate((el: HTMLInputElement) => el.files?.length),
    ).toBe(1); // max-files=1
    const detail = await page.evaluate(
      () => (window as unknown as { _err: { reason: string } })._err,
    );
    expect(detail.reason).toBe("too-many");
    await expect(host.locator(".re-file-picker__input")).toHaveAttribute("aria-invalid", "true");
  });

  test("validation: a disallowed type is rejected via re-error", async ({ page }) => {
    const host = page.getByTestId("validation").locator(".re-file-picker");
    await host.evaluate((el) => {
      (window as unknown as { _err: unknown })._err = null;
      el.addEventListener("re-error", (e) => {
        (window as unknown as { _err: unknown })._err = (e as CustomEvent).detail;
      });
    });
    await drop(host, [{ name: "doc.pdf", type: "application/pdf" }]); // accept="image/*"
    const detail = await page.evaluate(
      () => (window as unknown as { _err: { reason: string } })._err,
    );
    expect(detail.reason).toBe("wrong-type");
  });
});
