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

// Helper function to validate required environment variables (available for future use)
// Example usage: const baseUrl = requireEnv('VITE_BASE_URL');
// Uncomment and use when needed:
// function requireEnv(name: string): string {
//   const value = process.env[name];
//   if (!value) {
//     throw new Error(
//       `Missing required environment variable: ${name}. Set it in .env.local (local) or GitHub Secrets (CI)`,
//     );
//   }
//   return value;
// }

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
  // Note: Environment variables are loaded from:
  // - Local: .env.local file (loaded above and in auth fixture for worker processes)
  // - CI: GitHub Actions environment variables (set in .github/workflows/ci.yml)
  //
  // The auth fixture also loads .env.local directly in worker processes because
  // Playwright workers spawn as separate processes and don't inherit process.env
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
      ? "pnpm preview --port 4173 --host"
      : "pnpm build && pnpm preview --port 4173",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes
  },
});
