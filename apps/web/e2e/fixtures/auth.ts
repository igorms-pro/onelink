/* eslint-disable react-hooks/rules-of-hooks */
// This file uses Playwright fixtures, not React hooks. The "use" parameter is a Playwright convention.
import { test as base } from "@playwright/test";
import { authenticateUser } from "../helpers/auth";
import { setupPostHogInterception } from "../helpers/posthog";
import { existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to store the authenticated session state
const STORAGE_STATE_PATH = resolve(__dirname, "../.auth/storage-state.json");

type AuthFixtures = {
  authenticatedPage: any;
};

// Global variable to track if we've authenticated once
let hasAuthenticated = false;

export const test = base.extend<AuthFixtures>({
  // Authenticated page fixture with session reuse
  authenticatedPage: async ({ browser }, usePage, testInfo) => {
    // Load .env.local in worker process if not in CI
    // This ensures env vars are available in worker processes
    // (Playwright workers spawn as separate processes and don't inherit process.env from config)
    if (!process.env.CI) {
      const envPath = resolve(__dirname, "../../.env.local");
      if (existsSync(envPath)) {
        process.env.DOTENV_CONFIG_QUIET = "true";
        config({ path: envPath, override: true }); // Use override: true to ensure vars are set
      }
    }

    // Get test credentials from environment
    // @ts-expect-error - process.env is available in Node.js environment
    const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
    // @ts-expect-error - process.env is available in Node.js environment
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
    // @ts-expect-error - process.env is available in Node.js environment
    const testEmail = process.env.E2E_TEST_EMAIL || "test@example.com";
    // @ts-expect-error - process.env is available in Node.js environment
    const testPassword = process.env.E2E_TEST_PASSWORD || "testpassword123";

    // Check if credentials are missing or using placeholder values
    // If so, skip the test instead of failing
    if (
      !supabaseUrl ||
      !supabaseKey ||
      supabaseUrl.includes("placeholder") ||
      supabaseKey === "placeholder-key"
    ) {
      testInfo.skip(
        true,
        "Skipping test: E2E test credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in environment.",
      );
      return;
    }

    // Ensure .auth directory exists
    const authDir = resolve(__dirname, "../.auth");
    if (!existsSync(authDir)) {
      mkdirSync(authDir, { recursive: true });
    }

    // Only authenticate once, then reuse the storage state
    if (!hasAuthenticated || !existsSync(STORAGE_STATE_PATH)) {
      // Create a new context and authenticate
      const context = await browser.newContext();
      const page = await context.newPage();

      try {
        // Authenticate the user
        await authenticateUser(page, testEmail, testPassword);

        // Save the storage state for reuse
        await context.storageState({ path: STORAGE_STATE_PATH });
        hasAuthenticated = true;

        await context.close();
      } catch (error) {
        await context.close();
        // If authentication fails, throw the error
        throw error;
      }
    }

    // Create a new context using the saved storage state
    const context = await browser.newContext({
      storageState: STORAGE_STATE_PATH,
    });
    const page = await context.newPage();

    // Intercept PostHog requests to avoid real API calls during tests
    await setupPostHogInterception(page);

    // Use the authenticated page
    await usePage(page);

    // Cleanup
    await context.close();
  },
});

export { expect } from "@playwright/test";
