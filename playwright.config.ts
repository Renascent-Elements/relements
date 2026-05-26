import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  testIgnore: ["tests/unit/**"],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:4173/docs/examples/",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm exec http-server . -p 4173 -s -c-1",
    url: "http://localhost:4173/docs/examples/",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
