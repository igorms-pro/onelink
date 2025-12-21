import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local file if it exists (for local development)
// In CI, environment variables are set directly
if (!process.env.CI) {
  const envPath = resolve(__dirname, ".env.local");
  if (existsSync(envPath)) {
    // Suppress dotenv messages by setting quiet mode
    process.env.DOTENV_CONFIG_QUIET = "true";
    // Load env vars - use override: true to ensure they're set
    // This ensures env vars are available to worker processes
    const result = config({ path: envPath, override: false });
    if (result.error) {
      console.warn("Warning: Failed to load .env.local:", result.error);
    }
  }
}

// Note: Environment variables are loaded from:
// - Local: .env.local file (loaded above)
// - CI: GitHub Actions environment variables (set in .github/workflows/ci.yml)

// Ensure env vars are loaded and available
// Load .env.local before defining config so vars are available to workers
// This must happen BEFORE defineConfig so env vars are in process.env when workers spawn
const envPath = resolve(__dirname, ".env.local");
if (!process.env.CI && existsSync(envPath)) {
  process.env.DOTENV_CONFIG_QUIET = "true";
  config({ path: envPath, override: false });
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // Reduced retries for faster CI
  workers: process.env.CI ? 4 : 3, // 4 workers in CI, 3 locally to avoid overloading system
  reporter: process.env.CI ? "html" : "list",
  timeout: 30 * 1000, // 30 seconds per test
  expect: {
    timeout: 10 * 1000, // 10 seconds for assertions
  },
  use: {
    baseURL: process.env.VITE_BASE_URL || "http://localhost:4173",
    trace: "on-first-retry",
    actionTimeout: process.env.CI ? 15 * 1000 : 10 * 1000, // Longer timeout in CI
    navigationTimeout: process.env.CI ? 60 * 1000 : 30 * 1000, // Longer timeout in CI for networkidle
  },
  // Use globalSetup to ensure env vars are loaded before workers start
  globalSetup: !process.env.CI ? "./e2e/global-setup.ts" : undefined,
  projects: process.env.CI
    ? [
        // In CI, only run on Chromium for speed (most stable and fastest)
        {
          name: "chromium",
          use: { ...devices["Desktop Chrome"] },
        },
      ]
    : [
        // Locally, run on all browsers
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
