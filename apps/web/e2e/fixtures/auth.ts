/* eslint-disable react-hooks/rules-of-hooks */
// This file uses Playwright fixtures, not React hooks. The "use" parameter is a Playwright convention.
import { test as base } from "@playwright/test";
import { authenticateUser } from "../helpers/auth";

type AuthFixtures = {
  authenticatedPage: any;
};

export const test = base.extend<AuthFixtures>({
  // Authenticated page fixture
  authenticatedPage: async ({ page }, usePage) => {
    // Get test credentials from environment
    // @ts-expect-error - process.env is available in Node.js environment
    const testEmail = process.env.E2E_TEST_EMAIL || "test@example.com";
    // @ts-expect-error - process.env is available in Node.js environment
    const testPassword = process.env.E2E_TEST_PASSWORD || "testpassword123";

    // Authenticate the user
    await authenticateUser(page, testEmail, testPassword);

    // Use the authenticated page
    await usePage(page);
  },
});

export { expect } from "@playwright/test";
