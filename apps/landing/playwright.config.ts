import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local file if it exists (for local development)
// In CI, environment variables are set directly via GitHub Actions
if (!process.env.CI) {
  const envPath = resolve(__dirname, ".env.local");
  if (existsSync(envPath)) {
    process.env.DOTENV_CONFIG_QUIET = "true";
    config({ path: envPath, override: false });
  }
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : 3,
  reporter: process.env.CI ? "html" : "list",
  timeout: 30 * 1000, // 30 seconds per test
  expect: {
    timeout: 10 * 1000, // 10 seconds for assertions
  },
  use: {
    baseURL: process.env.VITE_BASE_URL || "http://localhost:4173",
    trace: "on-first-retry",
    actionTimeout: process.env.CI ? 15 * 1000 : 10 * 1000,
    navigationTimeout: process.env.CI ? 60 * 1000 : 30 * 1000,
  },
  projects: process.env.CI
    ? [
        {
          name: "chromium",
          use: { ...devices["Desktop Chrome"] },
        },
      ]
    : [
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
    command: process.env.CI
      ? "pnpm build && pnpm preview --port 4173 --host"
      : "pnpm build && pnpm preview --port 4173",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes
  },
});
