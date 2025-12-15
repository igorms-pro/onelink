// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// CORS helper (mirrors other JSON POST endpoints)
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ExportAuditStatus = "pending" | "success" | "error";

interface ExportAuditRow {
  id?: string;
  user_id: string;
  requested_at?: string;
  completed_at?: string | null;
  status: ExportAuditStatus;
  file_path?: string | null;
  file_size_bytes?: number | null;
  error_message?: string | null;
}

const ONE_HOUR_MS = 60 * 60 * 1000;

interface HandlerEnv {
  supabaseUrl?: string | null;
  supabaseAnonKey?: string | null;
  createClientImpl?: typeof createClient;
  now?: () => Date;
}

export async function handleExportUserDataRequest(
  req: Request,
  env: HandlerEnv = {},
) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  const supabaseUrl = env.supabaseUrl ?? Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey =
    env.supabaseAnonKey ?? Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response("Server configuration error", {
      status: 500,
      headers: corsHeaders,
    });
  }

  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.replace("Bearer ", "");

  if (!jwt) {
    return new Response("Unauthorized", {
      status: 401,
      headers: corsHeaders,
    });
  }

  const createClientImpl = env.createClientImpl ?? createClient;

  const supabase = createClientImpl(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });

  try {
    // 1) Resolve the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(jwt);

    if (authError || !user) {
      return new Response("Unauthorized", {
        status: 401,
        headers: corsHeaders,
      });
    }

    const userId = user.id;

    // 2) Rate limiting: check most recent export within last hour
    // Table is expected: public.export_audit (see SQL migration)
    const { data: recentAudits, error: auditError } = await supabase
      .from<ExportAuditRow>("export_audit")
      .select("*")
      .eq("user_id", userId)
      .order("requested_at", { ascending: false })
      .limit(1);

    if (auditError) {
      console.error("[export-user-data] Failed to read export_audit:", auditError);
    }

    if (recentAudits && recentAudits.length > 0) {
      const last = recentAudits[0];
      const nowMs = env.now ? env.now().getTime() : Date.now();
      const lastRequestedAt = last.requested_at
        ? new Date(last.requested_at).getTime()
        : 0;

      const isRecent = nowMs - lastRequestedAt < ONE_HOUR_MS;
      const isActive =
        last.status === "pending" ||
        (last.status === "success" &&
          last.completed_at &&
          nowMs - new Date(last.completed_at).getTime() < ONE_HOUR_MS);

      if (isRecent && isActive) {
        return new Response(
          JSON.stringify({
            error: "EXPORT_RATE_LIMITED",
            message:
              "You can request an export approximately once per hour. Please try again later.",
          }),
          {
            status: 429,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }
    }

    // 3) Insert initial audit row with pending status
    const requestedAt = new Date().toISOString();
    const { data: insertedAudit, error: insertAuditError } = await supabase
      .from<ExportAuditRow>("export_audit")
      .insert({
        user_id: userId,
        status: "pending",
        requested_at: requestedAt,
      } as ExportAuditRow)
      .select("*")
      .single();

    if (insertAuditError || !insertedAudit) {
      console.error(
        "[export-user-data] Failed to insert export_audit row:",
        insertAuditError,
      );
      return new Response("Failed to start export", {
        status: 500,
        headers: corsHeaders,
      });
    }

    const auditId = insertedAudit.id;

    // 4) Call RPC to get JSON payload
    const { data: exportJson, error: exportError } = await supabase.rpc(
      "export_user_data",
      { p_user_id: userId },
    );

    if (exportError) {
      console.error("[export-user-data] export_user_data failed:", exportError);

      if (auditId) {
        await supabase
          .from<ExportAuditRow>("export_audit")
          .update({
            status: "error",
            completed_at: new Date().toISOString(),
            error_message: exportError.message ?? "export_user_data failed",
          } as Partial<ExportAuditRow>)
          .eq("id", auditId);
      }

      return new Response("Failed to generate export data", {
        status: 500,
        headers: corsHeaders,
      });
    }

    // 5) Write JSON to Storage bucket `exports`
    // Stored as: {user_id}/{timestamp}.json
    const bucket = "exports";
    const nowIso = new Date().toISOString().replace(/[:.]/g, "-");
    const filePath = `${userId}/${nowIso}.json`;

    const jsonString = JSON.stringify(exportJson, null, 2);
    const fileBytes = new TextEncoder().encode(jsonString);

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBytes, {
        contentType: "application/json",
        upsert: false,
      });

    if (uploadError) {
      console.error("[export-user-data] Failed to upload export file:", uploadError);

      if (auditId) {
        await supabase
          .from<ExportAuditRow>("export_audit")
          .update({
            status: "error",
            completed_at: new Date().toISOString(),
            error_message: uploadError.message ?? "Upload failed",
          } as Partial<ExportAuditRow>)
          .eq("id", auditId);
      }

      return new Response("Failed to store export file", {
        status: 500,
        headers: corsHeaders,
      });
    }

    // 6) Generate signed URL (15–30 minutes TTL; use 20 min for middle ground)
    const ttlSeconds = 20 * 60;
    const {
      data: signed,
      error: signedError,
    } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, ttlSeconds);

    if (signedError || !signed?.signedUrl) {
      console.error("[export-user-data] Failed to create signed URL:", signedError);

      if (auditId) {
        await supabase
          .from<ExportAuditRow>("export_audit")
          .update({
            status: "error",
            completed_at: new Date().toISOString(),
            file_path: filePath,
            error_message: signedError?.message ?? "Signed URL failed",
          } as Partial<ExportAuditRow>)
          .eq("id", auditId);
      }

      return new Response("Failed to create export download URL", {
        status: 500,
        headers: corsHeaders,
      });
    }

    const completedAt = new Date().toISOString();

    // 7) Update audit row with success + metadata
    if (auditId) {
      await supabase
        .from<ExportAuditRow>("export_audit")
        .update({
          status: "success",
          completed_at: completedAt,
          file_path: filePath,
          file_size_bytes: fileBytes.byteLength,
        } as Partial<ExportAuditRow>)
        .eq("id", auditId);
    }

    // 8) Return signed URL + expiry to client
    return new Response(
      JSON.stringify({
        url: signed.signedUrl,
        expires_in: ttlSeconds,
        audit_id: auditId,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (e: any) {
    console.error("[export-user-data] Unexpected error:", e?.message ?? e);

    // Best-effort: we cannot easily recover auditId here unless we captured it above.
    return new Response("Unexpected error", {
      status: 500,
      headers: corsHeaders,
    });
  }
}

Deno.serve((req) => handleExportUserDataRequest(req));

