import { defineConfig, devices } from "@playwright/test";

// Note: Environment variables are loaded from:
// - Local: .env.local file (if exists) - loaded automatically by dotenv if present
// - CI: GitHub Actions environment variables (set in .github/workflows/ci.yml)
// We don't manually load dotenv here to avoid verbose messages in CI

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 3 : 0, // Increased retries for flaky tests in CI
  workers: process.env.CI ? 3 : undefined, // Run browsers in parallel in CI
  reporter: process.env.CI ? "html" : "list",
  timeout: 30 * 1000, // 30 seconds per test
  expect: {
    timeout: 10 * 1000, // 10 seconds for assertions
  },
  use: {
    baseURL: process.env.VITE_BASE_URL || "http://localhost:4173",
    trace: "on-first-retry",
    actionTimeout: 10 * 1000, // 10 seconds for actions
    navigationTimeout: 30 * 1000, // 30 seconds for navigation
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: {
    // In CI, we already built, so just preview. Locally, build + preview.
    command: process.env.CI
      ? "pnpm preview --port 4173"
      : "pnpm build && pnpm preview --port 4173",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes
  },
});
