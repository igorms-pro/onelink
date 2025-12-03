/* eslint-disable react-hooks/rules-of-hooks */
// This file uses Playwright fixtures, not React hooks. The "use" parameter is a Playwright convention.
import { test as base } from "@playwright/test";
import { authenticateUser } from "../helpers/auth";

type AuthFixtures = {
  authenticatedPage: any;
};

export const test = base.extend<AuthFixtures>({
  // Authenticated page fixture
  authenticatedPage: async ({ page }, usePage, testInfo) => {
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

    // Authenticate the user
    await authenticateUser(page, testEmail, testPassword);

    // Use the authenticated page
    await usePage(page);
  },
});

export { expect } from "@playwright/test";
