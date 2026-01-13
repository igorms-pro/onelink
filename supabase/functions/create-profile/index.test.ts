// Deno tests for create-profile Edge Function
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import { assertEquals } from "jsr:@std/assert@1.0.2";
import { handleCreateProfileRequest } from "./index.ts";

// Mock Supabase client
function createMockSupabaseClient(options: {
  userId?: string;
  existingProfile?: any | null;
  usernameTaken?: boolean;
  createError?: any;
  userEmail?: string;
}) {
  const {
    userId = "user-1",
    existingProfile = null,
    usernameTaken = false,
    createError = null,
    userEmail = "test@example.com",
  } = options;

  const profiles: Record<string, any> = {};
  if (usernameTaken) {
    profiles["testuser"] = {
      id: "profile-1",
      user_id: "other-user",
      slug: "testuser",
      display_name: null,
      bio: null,
      avatar_url: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };
  }

  return {
    auth: {
      // deno-lint-ignore require-await
      async getUser(_jwt: string) {
        return {
          data: { user: { id: userId, email: userEmail } },
          error: null,
        };
      },
    },
    from<T>(table: string) {
      if (table === "users") {
        return {
          // deno-lint-ignore require-await
          async upsert(_data: any, _options: any) {
            return { error: null };
          },
        };
      }
      if (table === "profiles") {
        return {
          select(_cols?: string) {
            return {
              eq(col: string, val: string) {
                if (col === "user_id") {
                  return {
                    // deno-lint-ignore require-await
                    async maybeSingle<T>() {
                      if (existingProfile) {
                        return { data: existingProfile, error: null };
                      }
                      return { data: null, error: { code: "PGRST116" } };
                    },
                  };
                }
                if (col === "slug") {
                  return {
                    // deno-lint-ignore require-await
                    async maybeSingle<T>() {
                      const profile = profiles[val];
                      if (profile) {
                        return { data: profile, error: null };
                      }
                      return { data: null, error: { code: "PGRST116" } };
                    },
                  };
                }
                return {
                  // deno-lint-ignore require-await
                  async maybeSingle<T>() {
                    return { data: null, error: { code: "PGRST116" } };
                  },
                };
              },
            };
          },
          insert(_data: any) {
            return {
              select(_cols?: string) {
                return {
                  // deno-lint-ignore require-await
                  async single<T>() {
                    if (createError) {
                      return { data: null, error: createError };
                    }
                    if (usernameTaken && _data.slug === "testuser") {
                      return {
                        data: null,
                        error: { code: "23505", message: "duplicate key value violates unique constraint" },
                      };
                    }
                    return {
                      data: {
                        id: "profile-new",
                        user_id: userId,
                        slug: _data.slug,
                        display_name: _data.display_name || null,
                        bio: _data.bio || null,
                        avatar_url: _data.avatar_url || null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                      },
                      error: null,
                    };
                  },
                };
              },
            };
          },
        };
      }
      return {
        select: () => ({
          eq: () => ({
            // deno-lint-ignore require-await
            async maybeSingle() {
              return { data: null, error: { code: "PGRST116" } };
            },
          }),
        }),
      };
    },
  };
}

// Mock admin client (service role)
function createMockAdminClient(options: {
  userId?: string;
  existingProfile?: any | null;
  usernameTaken?: boolean;
  createError?: any;
  userEmail?: string;
}) {
  const mockClient = createMockSupabaseClient(options);
  return {
    ...mockClient,
    auth: {
      admin: {
        // deno-lint-ignore require-await
        async getUserById(_userId: string) {
          return {
            data: { user: { email: options.userEmail || "test@example.com" } },
            error: null,
          };
        },
      },
    },
  };
}

Deno.test("create-profile returns UNAUTHORIZED when no token provided", async () => {
  const req = new Request("https://example.com", {
    method: "POST",
    body: JSON.stringify({ username: "testuser" }),
  });

  const res = await handleCreateProfileRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseAnonKey: "test-anon-key",
    serviceRoleKey: "test-service-key",
  });

  assertEquals(res.status, 401);
  const body = await res.json();
  assertEquals(body.error, "UNAUTHORIZED");
});

Deno.test("create-profile returns INVALID_USERNAME when username is missing", async () => {
  const req = new Request("https://example.com", {
    method: "POST",
    headers: {
      Authorization: "Bearer test-jwt",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  const res = await handleCreateProfileRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseAnonKey: "test-anon-key",
    serviceRoleKey: "test-service-key",
    createClientImpl: () => createMockSupabaseClient({}),
  });

  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.error, "INVALID_USERNAME");
});

Deno.test("create-profile returns INVALID_USERNAME when username is too short", async () => {
  const req = new Request("https://example.com", {
    method: "POST",
    headers: {
      Authorization: "Bearer test-jwt",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: "ab" }),
  });

  const res = await handleCreateProfileRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseAnonKey: "test-anon-key",
    serviceRoleKey: "test-service-key",
    createClientImpl: () => createMockSupabaseClient({}),
  });

  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.error, "INVALID_USERNAME");
  assertEquals(body.message.includes("at least 3 characters"), true);
});

Deno.test("create-profile returns INVALID_USERNAME when username is too long", async () => {
  const req = new Request("https://example.com", {
    method: "POST",
    headers: {
      Authorization: "Bearer test-jwt",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: "a".repeat(31) }),
  });

  const res = await handleCreateProfileRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseAnonKey: "test-anon-key",
    serviceRoleKey: "test-service-key",
    createClientImpl: () => createMockSupabaseClient({}),
  });

  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.error, "INVALID_USERNAME");
  assertEquals(body.message.includes("at most 30 characters"), true);
});

Deno.test("create-profile returns INVALID_USERNAME when username contains invalid characters", async () => {
  const req = new Request("https://example.com", {
    method: "POST",
    headers: {
      Authorization: "Bearer test-jwt",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: "test user" }),
  });

  const res = await handleCreateProfileRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseAnonKey: "test-anon-key",
    serviceRoleKey: "test-service-key",
    createClientImpl: () => createMockSupabaseClient({}),
  });

  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.error, "INVALID_USERNAME");
  assertEquals(body.message.includes("lowercase letters"), true);
});

Deno.test("create-profile returns USERNAME_TAKEN when username is already taken", async () => {
  const req = new Request("https://example.com", {
    method: "POST",
    headers: {
      Authorization: "Bearer test-jwt",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: "testuser" }),
  });

  const res = await handleCreateProfileRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseAnonKey: "test-anon-key",
    serviceRoleKey: "test-service-key",
    createClientImpl: () => createMockSupabaseClient({ usernameTaken: true }),
  });

  assertEquals(res.status, 409);
  const body = await res.json();
  assertEquals(body.error, "USERNAME_TAKEN");
});

Deno.test("create-profile returns error when user already has a profile", async () => {
  const req = new Request("https://example.com", {
    method: "POST",
    headers: {
      Authorization: "Bearer test-jwt",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: "newuser" }),
  });

  const existingProfile = {
    id: "profile-1",
    user_id: "user-1",
    slug: "olduser",
    display_name: null,
    bio: null,
    avatar_url: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  const res = await handleCreateProfileRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseAnonKey: "test-anon-key",
    serviceRoleKey: "test-service-key",
    createClientImpl: () => createMockSupabaseClient({ existingProfile }),
  });

  assertEquals(res.status, 500);
  const body = await res.json();
  assertEquals(body.error, "CREATE_FAILED");
  assertEquals(body.message.includes("already has a profile"), true);
});

Deno.test("create-profile successfully creates profile with valid username", async () => {
  const req = new Request("https://example.com", {
    method: "POST",
    headers: {
      Authorization: "Bearer test-jwt",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: "newuser" }),
  });

  const res = await handleCreateProfileRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseAnonKey: "test-anon-key",
    serviceRoleKey: "test-service-key",
    createClientImpl: () => createMockSupabaseClient({}),
  });

  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body.success, true);
  assertEquals(body.profile.slug, "newuser");
  assertEquals(body.profile.user_id, "user-1");
  assertEquals(typeof body.profile.id, "string");
});

Deno.test("create-profile handles OPTIONS request for CORS", async () => {
  const req = new Request("https://example.com", {
    method: "OPTIONS",
  });

  const res = await handleCreateProfileRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseAnonKey: "test-anon-key",
    serviceRoleKey: "test-service-key",
  });

  assertEquals(res.status, 204);
});
