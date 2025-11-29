import { createClient } from "@supabase/supabase-js";
import type { Page } from "@playwright/test";
import type { Session } from "@supabase/supabase-js";

// @ts-expect-error - process.env is available in Node.js environment
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
// @ts-expect-error - process.env is available in Node.js environment
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "";

/**
 * Authenticate a user in Playwright using Supabase
 * This saves the session to localStorage so the app can use it
 *
 * Note: Currently uses localStorage (as per current implementation)
 * There's a task to migrate to cookies in the future
 */
export async function authenticateUser(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in environment",
    );
  }

  // Check if using placeholder values (common in CI without real test credentials)
  if (
    SUPABASE_URL.includes("placeholder") ||
    SUPABASE_ANON_KEY === "placeholder-key"
  ) {
    throw new Error(
      "Cannot authenticate with placeholder Supabase credentials. " +
        "Please set E2E_SUPABASE_URL and E2E_SUPABASE_ANON_KEY secrets in GitHub Actions " +
        "or use real test credentials in your local environment.",
    );
  }

  // Create Supabase client on server side
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Sign in with password
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    throw new Error(
      `Failed to authenticate: ${error?.message || "No session"}`,
    );
  }

  // Navigate to the app
  await page.goto("/");

  // Extract project ref from URL (e.g., "xyzabc123" from "https://xyzabc123.supabase.co")
  const urlObj = new URL(SUPABASE_URL);
  const projectRef = urlObj.hostname.split(".")[0];

  // Set the session in localStorage using Supabase's format
  // Supabase stores it as: sb-{project-ref}-auth-token
  const session: Session = data.session;
  await page.evaluate(
    (args: { session: Session; projectRef: string }) => {
      localStorage.setItem(
        `sb-${args.projectRef}-auth-token`,
        JSON.stringify({
          access_token: args.session.access_token,
          refresh_token: args.session.refresh_token,
          expires_at: args.session.expires_at,
          expires_in: args.session.expires_in || 3600,
          token_type: "bearer",
          user: args.session.user,
        }),
      );
    },
    { session, projectRef },
  );

  // Reload to apply the auth state
  await page.reload();
  await page.waitForLoadState("networkidle");
}

/**
 * Create a test user session and save it to storageState
 * This can be used with Playwright's storageState option
 */
export async function createAuthenticatedContext(
  email: string,
  password: string,
): Promise<{ cookies: any[]; origins: any[] }> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in environment",
    );
  }

  // Check if using placeholder values
  if (
    SUPABASE_URL.includes("placeholder") ||
    SUPABASE_ANON_KEY === "placeholder-key"
  ) {
    throw new Error(
      "Cannot authenticate with placeholder Supabase credentials. " +
        "Please set E2E_SUPABASE_URL and E2E_SUPABASE_ANON_KEY secrets in GitHub Actions " +
        "or use real test credentials in your local environment.",
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    throw new Error(
      `Failed to authenticate: ${error?.message || "No session"}`,
    );
  }

  // Return storage state structure
  // Note: Supabase uses localStorage, not cookies, so we return empty cookies
  // The actual auth state will be set via page.evaluate in authenticateUser
  const session: Session = data.session;
  return {
    cookies: [],
    origins: [
      {
        origin: SUPABASE_URL,
        localStorage: [
          {
            name: `sb-${new URL(SUPABASE_URL).hostname.split(".")[0]}-auth-token`,
            value: JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: Math.floor(Date.now() / 1000) + 3600,
              expires_in: 3600,
              token_type: "bearer",
              user: session.user,
            }),
          },
        ],
      },
    ],
  };
}
