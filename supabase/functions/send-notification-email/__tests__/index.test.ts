// Deno tests for send-notification-email Edge Function
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import { assertEquals } from "jsr:@std/assert@1.0.2";
import { handleSendNotificationEmailRequest } from "../index.ts";

// Mock Supabase client
function createMockSupabaseClient(options: {
  userPreferences?: { email_notifications: boolean } | null;
  submission?: any;
  user?: { email: string } | null;
  updateError?: any;
}): any {
  const {
    userPreferences = { email_notifications: true },
    submission = {
      id: "sub-1",
      created_at: "2024-01-01T00:00:00Z",
      name: "John",
      email: "john@example.com",
      note: "Test note",
      files: [{ path: "file.pdf", size: 1024 }],
      drop_id: "drop-1",
      drops: {
        id: "drop-1",
        label: "Test Drop",
        profile_id: "profile-1",
        last_email_sent_at: null,
        profiles: {
          id: "profile-1",
          user_id: "user-1",
        },
      },
    },
    user = { email: "owner@example.com" },
    updateError = null,
  } = options;

  return {
    from: (table: string) => {
      if (table === "user_preferences") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: userPreferences,
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "submissions") {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({
                data: submission,
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "drops") {
        return {
          update: () => ({
            eq: async () => ({
              data: null,
              error: updateError,
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

// Mock sendEmail function
function createMockSendEmail(success: boolean = true, error?: string) {
  return async () => ({
    success,
    id: success ? "email-123" : undefined,
    error,
  });
}

// Mock readTextFile
function createMockReadTextFile(templates: Record<string, string> = {}) {
  return async (path: string | URL) => {
    const pathStr = typeof path === "string" ? path : path.toString();
    // Check exact match first
    if (templates[pathStr]) {
      return templates[pathStr];
    }
    // Check for partial matches (handle different path formats)
    for (const [key, value] of Object.entries(templates)) {
      if (pathStr.includes(key) || pathStr.endsWith(key.split("/").pop() || "")) {
        return value;
      }
    }
    // Default fallback templates
    if (pathStr.includes("new-submission.html")) {
      return "<h1>New Submission: {{drop_label}}</h1>";
    }
    if (pathStr.includes("new-submission.txt") || pathStr.includes("new-submission.text")) {
      return "New Submission: {{drop_label}}";
    }
    throw new Error("Template not found");
  };
}

Deno.test("send-notification-email: returns 405 for non-POST methods", async () => {
  const req = new Request("https://example.com", { method: "GET" });
  const res = await handleSendNotificationEmailRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseServiceRoleKey: "test-key",
    createClientImpl: () => createMockSupabaseClient({}),
  });

  assertEquals(res.status, 405);
});

Deno.test("send-notification-email: handles CORS preflight (OPTIONS)", async () => {
  const req = new Request("https://example.com", { method: "OPTIONS" });
  const res = await handleSendNotificationEmailRequest(req);

  assertEquals(res.status, 200);
  assertEquals(res.headers.get("Access-Control-Allow-Origin"), "*");
});

Deno.test("send-notification-email: returns 400 if submission_id missing", async () => {
  const req = new Request("https://example.com", {
    method: "POST",
    body: JSON.stringify({ user_id: "user-1" }),
  });
  const res = await handleSendNotificationEmailRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseServiceRoleKey: "test-key",
    createClientImpl: () => createMockSupabaseClient({}),
  });

  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.error, "Missing submission_id or user_id");
});

Deno.test("send-notification-email: returns 400 if user_id missing", async () => {
  const req = new Request("https://example.com", {
    method: "POST",
    body: JSON.stringify({ submission_id: "sub-1" }),
  });
  const res = await handleSendNotificationEmailRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseServiceRoleKey: "test-key",
    createClientImpl: () => createMockSupabaseClient({}),
  });

  assertEquals(res.status, 400);
});

Deno.test("send-notification-email: returns 500 if Supabase config missing", async () => {
  const req = new Request("https://example.com", {
    method: "POST",
    body: JSON.stringify({ submission_id: "sub-1", user_id: "user-1" }),
  });
  const res = await handleSendNotificationEmailRequest(req, {
    supabaseUrl: "",
    supabaseServiceRoleKey: "",
  });

  assertEquals(res.status, 500);
  const body = await res.json();
  assertEquals(body.error, "Server configuration error");
});

Deno.test("send-notification-email: returns 200 (skipped) if email notifications disabled", async () => {
  const req = new Request("https://example.com", {
    method: "POST",
    body: JSON.stringify({ submission_id: "sub-1", user_id: "user-1" }),
  });
  const res = await handleSendNotificationEmailRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseServiceRoleKey: "test-key",
    createClientImpl: () =>
      createMockSupabaseClient({
        userPreferences: { email_notifications: false },
      }),
  });

  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body.skipped, true);
  assertEquals(body.message, "Email notifications disabled");
});

Deno.test("send-notification-email: returns 404 if submission not found", async () => {
  const req = new Request("https://example.com", {
    method: "POST",
    body: JSON.stringify({ submission_id: "sub-1", user_id: "user-1" }),
  });

  let callCount = 0;
  const mockClient: any = createMockSupabaseClient({});
  const originalFrom = mockClient.from;
  mockClient.from = (table: string): any => {
    if (table === "user_preferences") {
      return originalFrom(table);
    }
    if (table === "submissions") {
      callCount++;
      return {
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: null,
              error: { message: "Not found" },
            }),
          }),
        }),
      };
    }
    return originalFrom(table);
  };

  const res = await handleSendNotificationEmailRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseServiceRoleKey: "test-key",
    createClientImpl: () => mockClient,
  });

  assertEquals(res.status, 404);
  const body = await res.json();
  assertEquals(body.error, "Submission not found");
});

Deno.test("send-notification-email: returns 403 if submission doesn't belong to user", async () => {
  const req = new Request("https://example.com", {
    method: "POST",
    body: JSON.stringify({ submission_id: "sub-1", user_id: "user-2" }), // Different user
  });
  const res = await handleSendNotificationEmailRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseServiceRoleKey: "test-key",
    createClientImpl: () => createMockSupabaseClient({}), // submission belongs to user-1
  });

  assertEquals(res.status, 403);
  const body = await res.json();
  assertEquals(body.error, "Unauthorized");
});

Deno.test("send-notification-email: rate limiting - returns 200 (skipped) if email sent < 5 min ago", async () => {
  const fiveMinutesAgo = new Date(Date.now() - 4 * 60 * 1000).toISOString(); // 4 minutes ago

  const req = new Request("https://example.com", {
    method: "POST",
    body: JSON.stringify({ submission_id: "sub-1", user_id: "user-1" }),
  });
  const res = await handleSendNotificationEmailRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseServiceRoleKey: "test-key",
    createClientImpl: () =>
      createMockSupabaseClient({
        submission: {
          id: "sub-1",
          created_at: "2024-01-01T00:00:00Z",
          name: "John",
          email: "john@example.com",
          note: "Test note",
          files: [],
          drop_id: "drop-1",
          drops: {
            id: "drop-1",
            label: "Test Drop",
            profile_id: "profile-1",
            last_email_sent_at: fiveMinutesAgo, // Recently sent
            profiles: {
              id: "profile-1",
              user_id: "user-1",
            },
          },
        },
      }),
  });

  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body.skipped, true);
  assertEquals(body.message, "Rate limited");
});

Deno.test("send-notification-email: sends email with correct data", async () => {
  let sentEmail: any = null;
  const mockSendEmail = async (options: any) => {
    sentEmail = options;
    return { success: true, id: "email-123" };
  };

  const req = new Request("https://example.com", {
    method: "POST",
    body: JSON.stringify({ submission_id: "sub-1", user_id: "user-1" }),
  });
  const res = await handleSendNotificationEmailRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseServiceRoleKey: "test-key",
    siteUrl: "https://test.com",
    createClientImpl: () => createMockSupabaseClient({}),
    sendEmailImpl: mockSendEmail,
    readTextFileImpl: createMockReadTextFile(),
  });

  assertEquals(res.status, 200);
  assertEquals(sentEmail.to, "owner@example.com");
  assertEquals(sentEmail.subject, "New submission: Test Drop");
  assertEquals(sentEmail.html.includes("Test Drop"), true);
});

Deno.test("send-notification-email: updates last_email_sent_at after successful send", async () => {
  let updateCalled = false;
  const mockClient = createMockSupabaseClient({});
  const originalFrom = mockClient.from;
  mockClient.from = (table: string) => {
    if (table === "drops") {
      return {
        update: () => ({
          eq: async () => {
            updateCalled = true;
            return { data: null, error: null };
          },
        }),
      };
    }
    return originalFrom(table);
  };

  const req = new Request("https://example.com", {
    method: "POST",
    body: JSON.stringify({ submission_id: "sub-1", user_id: "user-1" }),
  });
  const res = await handleSendNotificationEmailRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseServiceRoleKey: "test-key",
    createClientImpl: () => mockClient,
    sendEmailImpl: createMockSendEmail(true),
    readTextFileImpl: createMockReadTextFile(),
  });

  assertEquals(res.status, 200);
  assertEquals(updateCalled, true);
});

Deno.test("send-notification-email: returns 500 if email send fails", async () => {
  const req = new Request("https://example.com", {
    method: "POST",
    body: JSON.stringify({ submission_id: "sub-1", user_id: "user-1" }),
  });
  const res = await handleSendNotificationEmailRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseServiceRoleKey: "test-key",
    createClientImpl: () => createMockSupabaseClient({}),
    sendEmailImpl: createMockSendEmail(false, "Email service error"),
    readTextFileImpl: createMockReadTextFile(),
  });

  assertEquals(res.status, 500);
  const body = await res.json();
  assertEquals(body.error, "Email service error");
});

Deno.test("send-notification-email: template rendering with correct variables", async () => {
  // Use paths that match what the function actually uses
  const templates: Record<string, string> = {};
  // The function uses: ./_shared/emails/new-submission.html and ./_shared/emails/new-submission.text
  // But we need to match the actual path format
  templates["./_shared/emails/new-submission.html"] = "<h1>{{drop_label}}</h1><p>{{submitter_name}}</p>";
  templates["./_shared/emails/new-submission.text"] = "{{drop_label}} - {{submitter_name}}";
  templates["./_shared/emails/new-submission.txt"] = "{{drop_label}} - {{submitter_name}}";

  let sentEmail: any = null;
  const mockSendEmail = async (options: any) => {
    sentEmail = options;
    return { success: true, id: "email-123" };
  };

  const req = new Request("https://example.com", {
    method: "POST",
    body: JSON.stringify({ submission_id: "sub-1", user_id: "user-1" }),
  });
  const res = await handleSendNotificationEmailRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseServiceRoleKey: "test-key",
    createClientImpl: () => createMockSupabaseClient({}),
    sendEmailImpl: mockSendEmail,
    readTextFileImpl: createMockReadTextFile(templates),
  });

  // Verify request succeeded
  assertEquals(res.status, 200);
  
  // Verify email was sent (the function logs show it was sent, so check sentEmail)
  // Note: Even if template read fails, fallback template is used and email is still sent
  assertEquals(sentEmail !== null, true);
  
  // Verify template variables were rendered (check both html and text)
  if (sentEmail) {
    // The email should contain the drop label and submitter name
    const hasDropLabel = sentEmail.html.includes("Test Drop") || sentEmail.text.includes("Test Drop");
    const hasSubmitterName = sentEmail.html.includes("John") || sentEmail.text.includes("John");
    assertEquals(hasDropLabel, true);
    assertEquals(hasSubmitterName, true);
  }
});
