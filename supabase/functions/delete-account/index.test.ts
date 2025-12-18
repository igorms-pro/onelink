// Minimal Deno tests for delete-account handler with MFA verification

import { assertEquals } from "jsr:@std/assert@1.0.2/equals";
import { handleDeleteAccountRequest } from "./index.ts";

// Stub for Supabase client used by the handler
function createStubClient(options: {
  userId?: string;
  hasMfaEnabled?: boolean;
  mfaVerificationSuccess?: boolean;
}) {
  const {
    userId = "user-1",
    hasMfaEnabled = true,
    mfaVerificationSuccess = true,
  } = options;

  const totpFactors = hasMfaEnabled
    ? [{ id: "factor-1", type: "totp", friendly_name: "Authenticator App" }]
    : [];

  return {
    auth: {
      // deno-lint-ignore require-await
      async getUser(_jwt: string) {
        return {
          data: { user: { id: userId, email: "test@example.com" } },
          error: null,
        };
      },
      mfa: {
        // deno-lint-ignore require-await
        async listFactors() {
          if (!hasMfaEnabled) {
            return { data: { totp: [] }, error: null };
          }
          return {
            data: { totp: totpFactors },
            error: null,
          };
        },
        // deno-lint-ignore require-await
        async challenge(_params: { factorId: string }) {
          if (!hasMfaEnabled) {
            return { data: null, error: { message: "No factors" } };
          }
          return {
            data: { id: "challenge-1" },
            error: null,
          };
        },
        // deno-lint-ignore require-await
        async verify(_params: { factorId: string; code: string; challengeId: string }) {
          if (!mfaVerificationSuccess) {
            return { error: { message: "Invalid code" } };
          }
          return { error: null };
        },
      },
    },
    from<T>(_table: string) {
      return {
        select(_cols?: string) {
          return {
            eq(_col: string, _val: string) {
              return {
                in(_col2: string, _vals: string[]) {
                  return {
                    // deno-lint-ignore require-await
                    async head() {
                      return { count: 0, error: null };
                    },
                  };
                },
                // deno-lint-ignore require-await
                async head() {
                  return { count: 0, error: null };
                },
              };
            },
            in(_col: string, _vals: string[]) {
              return {
                // deno-lint-ignore require-await
                async head() {
                  return { count: 0, error: null };
                },
              };
            },
          };
        },
        // deno-lint-ignore require-await
        async delete() {
          return {
            eq(_col: string, _val: string) {
              return { data: null, error: null };
            },
          };
        },
      };
    },
  };
}

Deno.test("delete-account returns MFA_CODE_REQUIRED when mfa_code is missing", async () => {
  const req = new Request("https://example.com", {
    method: "POST",
    headers: {
      Authorization: "Bearer test-jwt",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  const res = await handleDeleteAccountRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseAnonKey: "test-anon-key",
    serviceRoleKey: "test-service-key",
    createClientImpl: () => createStubClient({}),
  });

  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.error, "MFA_CODE_REQUIRED");
});

Deno.test("delete-account returns MFA_CODE_REQUIRED when mfa_code is too short", async () => {
  const req = new Request("https://example.com", {
    method: "POST",
    headers: {
      Authorization: "Bearer test-jwt",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mfa_code: "123" }),
  });

  const res = await handleDeleteAccountRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseAnonKey: "test-anon-key",
    serviceRoleKey: "test-service-key",
    createClientImpl: () => createStubClient({}),
  });

  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.error, "MFA_CODE_REQUIRED");
});

Deno.test("delete-account returns MFA_NOT_ENABLED when user has no MFA factors", async () => {
  const req = new Request("https://example.com", {
    method: "POST",
    headers: {
      Authorization: "Bearer test-jwt",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mfa_code: "123456" }),
  });

  const res = await handleDeleteAccountRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseAnonKey: "test-anon-key",
    serviceRoleKey: "test-service-key",
    createClientImpl: () => createStubClient({ hasMfaEnabled: false }),
  });

  assertEquals(res.status, 403);
  const body = await res.json();
  assertEquals(body.error, "MFA_NOT_ENABLED");
});

Deno.test("delete-account returns MFA_CODE_INVALID when code verification fails", async () => {
  const req = new Request("https://example.com", {
    method: "POST",
    headers: {
      Authorization: "Bearer test-jwt",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mfa_code: "123456" }),
  });

  const res = await handleDeleteAccountRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseAnonKey: "test-anon-key",
    serviceRoleKey: "test-service-key",
    createClientImpl: () => createStubClient({
      hasMfaEnabled: true,
      mfaVerificationSuccess: false,
    }),
  });

  assertEquals(res.status, 401);
  const body = await res.json();
  assertEquals(body.error, "MFA_CODE_INVALID");
});

Deno.test("delete-account returns DELETE_ACCOUNT_DISABLED when feature flag is false", async () => {
  const req = new Request("https://example.com", {
    method: "POST",
    headers: {
      Authorization: "Bearer test-jwt",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mfa_code: "123456" }),
  });

  const res = await handleDeleteAccountRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseAnonKey: "test-anon-key",
    serviceRoleKey: "test-service-key",
    deleteAccountEnabled: "false",
    createClientImpl: () => createStubClient({
      hasMfaEnabled: true,
      mfaVerificationSuccess: true,
    }),
  });

  assertEquals(res.status, 503);
  const body = await res.json();
  assertEquals(body.error, "DELETE_ACCOUNT_DISABLED");
});

Deno.test("delete-account returns 401 when JWT is missing", async () => {
  const req = new Request("https://example.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mfa_code: "123456" }),
  });

  const res = await handleDeleteAccountRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseAnonKey: "test-anon-key",
    serviceRoleKey: "test-service-key",
    createClientImpl: () => createStubClient({}),
  });

  assertEquals(res.status, 401);
});

Deno.test("delete-account returns 401 when user authentication fails", async () => {
  const req = new Request("https://example.com", {
    method: "POST",
    headers: {
      Authorization: "Bearer invalid-jwt",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mfa_code: "123456" }),
  });

  const res = await handleDeleteAccountRequest(req, {
    supabaseUrl: "https://test.supabase.co",
    supabaseAnonKey: "test-anon-key",
    serviceRoleKey: "test-service-key",
    createClientImpl: () => ({
      auth: {
        // deno-lint-ignore require-await
        async getUser(_jwt: string) {
          return {
            data: { user: null },
            error: { message: "Invalid token" },
          };
        },
      },
    }),
  });

  assertEquals(res.status, 401);
  const body = await res.json();
  assertEquals(body.error, "Unauthorized");
});

