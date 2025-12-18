// Minimal Deno tests for export-user-data handler

import { assertEquals } from "jsr:@std/assert@1.0.2/equals";
import { handleExportUserDataRequest } from "./index.ts";

// Simple in-memory stub for Supabase client used by the handler
function createStubClient(options: {
  userId?: string;
  recentAudit?: any | null;
}) {
  const { userId = "user-1", recentAudit = null } = options;

  const auditRows = recentAudit ? [recentAudit] : [];

  return {
    auth: {
      // deno-lint-ignore require-await
      async getUser(_jwt: string) {
        return {
          data: { user: { id: userId } },
          error: null,
        };
      },
    },
    from<T>(_table: string) {
      const table = _table;

      return {
        select(_cols?: string) {
          if (table === "export_audit") {
            return {
              eq() {
                return {
                  order() {
                    return {
                      // deno-lint-ignore require-await
                      async limit(_n: number) {
                        return { data: auditRows as T[], error: null };
                      },
                    };
                  },
                };
              },
              // For insert/update paths we only return shape used by handler
              // deno-lint-ignore require-await
              async insert(_payload: any) {
                const row = {
                  id: "audit-1",
                  ..._payload,
                };
                return { data: [row as T], error: null };
              },
              update(_payload: any) {
                return {
                  // deno-lint-ignore require-await
                  async eq(_col: string, _val: string) {
                    return { data: null, error: null };
                  },
                };
              },
            };
          }

          return {
            // deno-lint-ignore require-await
            async eq() {
              return { data: [] as T[], error: null };
            },
          };
        },
      };
    },
    // deno-lint-ignore require-await
    async rpc(_fn: string, _params: Record<string, unknown>) {
      return { data: { some: "export-json" }, error: null };
    },
    storage: {
      from(_bucket: string) {
        return {
          // deno-lint-ignore require-await
          async upload(_path: string, _bytes: Uint8Array, _opts: unknown) {
            return { error: null };
          },
          // deno-lint-ignore require-await
          async createSignedUrl(_path: string, _ttl: number) {
            return {
              data: { signedUrl: "https://example.com/export.json" },
              error: null,
            };
          },
        };
      },
    },
  };
}

Deno.test("export-user-data returns signed URL on success", async () => {
  const req = new Request("https://example.com", {
    method: "POST",
    headers: {
      Authorization: "Bearer test-jwt",
    },
  });

  const now = new Date("2025-01-01T00:00:00.000Z");

  const res = await handleExportUserDataRequest(req, {
    supabaseUrl: "https://example.supabase.co",
    supabaseAnonKey: "anon-key",
    createClientImpl: () => createStubClient({}),
    now: () => now,
  });

  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(typeof body.url, "string");
  assertEquals(body.expires_in, 20 * 60);
});

Deno.test("export-user-data enforces cooldown when recent export exists", async () => {
  const req = new Request("https://example.com", {
    method: "POST",
    headers: {
      Authorization: "Bearer test-jwt",
    },
  });

  const now = new Date("2025-01-01T01:00:00.000Z");
  const recentRequestedAt = new Date(now.getTime() - 10 * 60 * 1000).toISOString(); // 10 minutes ago

  const res = await handleExportUserDataRequest(req, {
    supabaseUrl: "https://example.supabase.co",
    supabaseAnonKey: "anon-key",
    createClientImpl: () =>
      createStubClient({
        recentAudit: {
          id: "audit-1",
          user_id: "user-1",
          requested_at: recentRequestedAt,
          status: "pending",
        },
      }),
    now: () => now,
  });

  assertEquals(res.status, 429);
  const body = await res.json();
  assertEquals(body.error, "EXPORT_RATE_LIMITED");
});



