// Deno tests for send-weekly-digest Edge Function
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import { assertEquals } from "jsr:@std/assert@1.0.2";
import { handleSendWeeklyDigestRequest } from "../index.ts";

// Mock Supabase client
function createMockSupabaseClient(options: {
  preferences?: Array<{ user_id: string }>;
  profiles?: Array<{ id: string }>;
  drops?: Array<{ id: string; label: string; profile_id: string }>;
  submissions?: Array<any>;
  user?: { email: string } | null;
}) {
  const {
    preferences = [{ user_id: "user-1" }],
    profiles = [{ id: "profile-1" }],
    drops = [{ id: "drop-1", label: "Test Drop", profile_id: "profile-1" }],
    submissions = [
      {
        id: "sub-1",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        name: "John",
        email: "john@example.com",
        note: "Test",
        files: [{ path: "file.pdf" }],
        drop_id: "drop-1",
      },
    ],
    user = { email: "user@example.com" },
  } = options;

  return {
    from: (table: string) => {
      if (table === "user_preferences") {
        return {
          select: () => ({
            eq: () => ({
              data: preferences,
              error: null,
            }),
          }),
        };
      }
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              data: profiles,
              error: null,
            }),
          }),
        };
      }
      if (table === "drops") {
        return {
          select: () => ({
            in: () => ({
              data: drops,
              error: null,
            }),
          }),
        };
      }
      if (table === "submissions") {
        return {
          select: () => ({
            in: () => ({
              gte: () => ({
                lt: () => ({
                  is: () => ({
                    order: () => ({
                      data: submissions,
                      error: null,
                    }),
                    data: submissions,
                    error: null,
                  }),
                  data: submissions,
                  error: null,
                }),
                data: submissions,
                error: null,
              }),
              data: submissions,
              error: null,
            }),
          }),
        };
      }
      return {};
    },
    auth: {
      admin: {
        getUserById: async () => ({
          data: { user },
          error: null,
        }),
      },
    },
  };
}

// Mock sendEmail
function createMockSendEmail(success: boolean = true) {
  return async () => ({
    success,
    id: success ? "email-123" : undefined,
    error: success ? undefined : "Email error",
  });
}

// Mock readTextFile
function createMockReadTextFile(templates: Record<string, string> = {}) {
  return async (path: string | URL) => {
    const pathStr = typeof path === "string" ? path : path.toString();
    if (templates[pathStr]) {
      return templates[pathStr];
    }
    if (pathStr.includes("weekly-digest.html")) {
      return "<h1>Weekly Digest</h1><p>{{total_submissions}}</p>";
    }
    if (pathStr.includes("weekly-digest.txt")) {
      return "Weekly Digest\n{{total_submissions}}";
    }
    throw new Error("Template not found");
  };
}

Deno.test("send-weekly-digest: returns 405 for non-POST methods", async () => {
  const req = new Request("https://example.com", { method: "GET" });
  const res = await handleSendWeeklyDigestRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseServiceRoleKey: "test-key",
    createClientImpl: () => createMockSupabaseClient({}),
  });

  assertEquals(res.status, 405);
});

Deno.test("send-weekly-digest: handles CORS preflight (OPTIONS)", async () => {
  const req = new Request("https://example.com", { method: "OPTIONS" });
  const res = await handleSendWeeklyDigestRequest(req);

  assertEquals(res.status, 200);
  assertEquals(res.headers.get("Access-Control-Allow-Origin"), "*");
});

Deno.test("send-weekly-digest: returns 500 if Supabase config missing", async () => {
  const req = new Request("https://example.com", { method: "POST" });
  const res = await handleSendWeeklyDigestRequest(req, {
    supabaseUrl: "",
    supabaseServiceRoleKey: "",
  });

  assertEquals(res.status, 500);
  const body = await res.json();
  assertEquals(body.error, "Server configuration error");
});

Deno.test("send-weekly-digest: retrieves users with weekly_digest = true", async () => {
  const req = new Request("https://example.com", { method: "POST" });
  let preferencesQueried = false;

  const mockClient = createMockSupabaseClient({
    preferences: [{ user_id: "user-1" }, { user_id: "user-2" }],
  });
  const originalFrom = mockClient.from;
  mockClient.from = (table: string) => {
    if (table === "user_preferences") {
      preferencesQueried = true;
    }
    return originalFrom(table);
  };

  const res = await handleSendWeeklyDigestRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseServiceRoleKey: "test-key",
    createClientImpl: () => mockClient,
    sendEmailImpl: createMockSendEmail(true),
    readTextFileImpl: createMockReadTextFile(),
  });

  assertEquals(preferencesQueried, true);
  assertEquals(res.status, 200);
});

Deno.test("send-weekly-digest: ignores users without preference", async () => {
  const req = new Request("https://example.com", { method: "POST" });
  const res = await handleSendWeeklyDigestRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseServiceRoleKey: "test-key",
    createClientImpl: () => createMockSupabaseClient({ preferences: [] }),
  });

  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body.processed, 0);
  assertEquals(body.message, "No users to process");
});

Deno.test("send-weekly-digest: aggregates submissions by drop for past week", async () => {
  const req = new Request("https://example.com", { method: "POST" });
  let sentEmail: any = null;

  const mockSendEmail = async (options: any) => {
    sentEmail = options;
    return { success: true, id: "email-123" };
  };

  const res = await handleSendWeeklyDigestRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseServiceRoleKey: "test-key",
    createClientImpl: () =>
      createMockSupabaseClient({
        preferences: [{ user_id: "user-1" }],
        submissions: [
          {
            id: "sub-1",
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            name: "John",
            files: [{ path: "file1.pdf" }],
            drop_id: "drop-1",
            drops: { id: "drop-1", label: "Drop 1" },
          },
          {
            id: "sub-2",
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            name: "Jane",
            files: [{ path: "file2.pdf" }, { path: "file3.pdf" }],
            drop_id: "drop-1",
            drops: { id: "drop-1", label: "Drop 1" },
          },
        ],
      }),
    sendEmailImpl: mockSendEmail,
    readTextFileImpl: createMockReadTextFile(),
  });

  assertEquals(res.status, 200);
  assertEquals(sentEmail !== null, true);
  // Verify email contains aggregated data
  assertEquals(sentEmail.subject.includes("2"), true); // 2 submissions
});

Deno.test("send-weekly-digest: sends email per user with preference enabled", async () => {
  const req = new Request("https://example.com", { method: "POST" });
  let emailCount = 0;

  const mockSendEmail = async () => {
    emailCount++;
    return { success: true, id: `email-${emailCount}` };
  };

  const res = await handleSendWeeklyDigestRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseServiceRoleKey: "test-key",
    createClientImpl: () =>
      createMockSupabaseClient({
        preferences: [{ user_id: "user-1" }, { user_id: "user-2" }],
      }),
    sendEmailImpl: mockSendEmail,
    readTextFileImpl: createMockReadTextFile(),
  });

  assertEquals(res.status, 200);
  const body = await res.json();
  // Should process 2 users
  assertEquals(body.processed, 2);
});

Deno.test("send-weekly-digest: template rendered with correct aggregated data", async () => {
  const req = new Request("https://example.com", { method: "POST" });
  let sentEmail: any = null;

  const templates = {
    "./_shared/emails/weekly-digest.html": "<h1>{{total_submissions}} submissions</h1>",
    "./_shared/emails/weekly-digest.txt": "{{total_submissions}} submissions",
  };

  const mockSendEmail = async (options: any) => {
    sentEmail = options;
    return { success: true, id: "email-123" };
  };

  await handleSendWeeklyDigestRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseServiceRoleKey: "test-key",
    createClientImpl: () =>
      createMockSupabaseClient({
        preferences: [{ user_id: "user-1" }],
        submissions: [
          {
            id: "sub-1",
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            name: "John",
            files: [],
            drop_id: "drop-1",
            drops: { id: "drop-1", label: "Drop 1" },
          },
        ],
      }),
    sendEmailImpl: mockSendEmail,
    readTextFileImpl: createMockReadTextFile(templates),
  });

  assertEquals(sentEmail !== null, true);
  assertEquals(sentEmail.html.includes("1"), true); // 1 submission
  assertEquals(sentEmail.text.includes("1"), true);
});

Deno.test("send-weekly-digest: skips users without submissions", async () => {
  const req = new Request("https://example.com", { method: "POST" });
  const res = await handleSendWeeklyDigestRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseServiceRoleKey: "test-key",
    createClientImpl: () =>
      createMockSupabaseClient({
        preferences: [{ user_id: "user-1" }],
        submissions: [], // No submissions
      }),
    sendEmailImpl: createMockSendEmail(true),
    readTextFileImpl: createMockReadTextFile(),
  });

  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body.skipped, 1); // User skipped due to no submissions
  assertEquals(body.succeeded, 0);
});

Deno.test("send-weekly-digest: handles errors per user without failing all", async () => {
  const req = new Request("https://example.com", { method: "POST" });
  let callCount = 0;

  const mockSendEmail = async () => {
    callCount++;
    if (callCount === 1) {
      return { success: false, error: "Email error" };
    }
    return { success: true, id: "email-123" };
  };

  const res = await handleSendWeeklyDigestRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseServiceRoleKey: "test-key",
    createClientImpl: () =>
      createMockSupabaseClient({
        preferences: [{ user_id: "user-1" }, { user_id: "user-2" }],
      }),
    sendEmailImpl: mockSendEmail,
    readTextFileImpl: createMockReadTextFile(),
  });

  assertEquals(res.status, 200);
  const body = await res.json();
  // Should process both users, one fails, one succeeds
  assertEquals(body.processed, 2);
  assertEquals(body.failed, 1);
  assertEquals(body.succeeded, 1);
});

Deno.test("send-weekly-digest: returns correct summary (succeeded, skipped, failed)", async () => {
  const req = new Request("https://example.com", { method: "POST" });
  const res = await handleSendWeeklyDigestRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseServiceRoleKey: "test-key",
    createClientImpl: () =>
      createMockSupabaseClient({
        preferences: [{ user_id: "user-1" }],
      }),
    sendEmailImpl: createMockSendEmail(true),
    readTextFileImpl: createMockReadTextFile(),
  });

  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(typeof body.processed, "number");
  assertEquals(typeof body.succeeded, "number");
  assertEquals(typeof body.skipped, "number");
  assertEquals(typeof body.failed, "number");
  assertEquals(Array.isArray(body.errors), true);
});

Deno.test("send-weekly-digest: handles error when fetching preferences fails", async () => {
  const req = new Request("https://example.com", { method: "POST" });
  const mockClient = createMockSupabaseClient({});
  mockClient.from = () => ({
    select: () => ({
      eq: () => ({
        data: null,
        error: { message: "Database error" },
      }),
    }),
  });

  const res = await handleSendWeeklyDigestRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseServiceRoleKey: "test-key",
    createClientImpl: () => mockClient,
  });

  assertEquals(res.status, 500);
  const body = await res.json();
  assertEquals(body.error, "Failed to fetch user preferences");
});
