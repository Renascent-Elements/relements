import { describe, expect, it } from "vitest";
import pkg from "../../packages/core/package.json" with { type: "json" };

describe("@relements/core package", () => {
  it("has the expected name", () => {
    expect(pkg.name).toBe("@relements/core");
  });

  it("declares CSS side effects", () => {
    expect(pkg.sideEffects).toContain("**/*.css");
  });

  it("exposes the root entry", () => {
    expect(pkg.exports["."]).toBeTruthy();
  });
});
