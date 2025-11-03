// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  // Check if called as scheduled job (no auth) or manual call (with auth)
  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.replace("Bearer ", "");
  const isScheduled = !jwt && req.method === "POST";

  // If manual call, require auth
  if (!isScheduled && req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  if (!isScheduled && !jwt) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    let profileId: string | null = null;
    let useRetentionDays = true;

    if (isScheduled) {
      // Scheduled job: process all profiles
      const { data: profiles } = await supabase.from("profiles").select("id");
      if (!profiles || profiles.length === 0) {
        return Response.json({ message: "No profiles to clean", deleted: 0 });
      }

      let totalDeletedSubmissions = 0;
      let totalDeletedFiles = 0;

      for (const profile of profiles) {
        const result = await cleanupProfile(supabase, profile.id, true);
        totalDeletedSubmissions += result.deletedSubmissions;
        totalDeletedFiles += result.deletedFiles;
      }

      return Response.json({
        message: "Scheduled cleanup completed",
        deleted_submissions: totalDeletedSubmissions,
        deleted_files: totalDeletedFiles,
      });
    } else {
      // Manual call: require profile_id
      const body = await req.json();
      profileId = body.profile_id;
      useRetentionDays = body.use_retention_days !== false;

      if (!profileId) {
        return new Response("profile_id required", { status: 400 });
      }

      const result = await cleanupProfile(supabase, profileId, useRetentionDays);
      return Response.json({
        deleted_submissions: result.deletedSubmissions,
        deleted_files: result.deletedFiles,
        message: "Cleanup completed",
      });
    }
  } catch (e: any) {
    return new Response(e?.message ?? "Cleanup failed", { status: 500 });
  }
});

async function cleanupProfile(
  supabase: any,
  profileId: string,
  useRetentionDays: boolean
) {

  // Get drops with their retention_days settings
  const { data: drops, error: dropsError } = await supabase
    .from("drops")
    .select("id, retention_days")
    .eq("profile_id", profileId);

  if (dropsError) throw dropsError;

  if (!drops || drops.length === 0) {
    return { deletedSubmissions: 0, deletedFiles: 0 };
  }

  // Get submissions per drop, using each drop's retention_days
  const allSubmissions: any[] = [];
  for (const drop of drops) {
    const retentionDays = useRetentionDays ? drop.retention_days : 365;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const { data: subs, error: subError } = await supabase
      .from("submissions")
      .select("id, drop_id, files, created_at")
      .eq("drop_id", drop.id)
      .lt("created_at", cutoffDate.toISOString());

    if (subError) throw subError;
    if (subs) allSubmissions.push(...subs);
  }

  let deletedFiles = 0;
  let deletedSubmissions = 0;

  // Delete files from Storage and then delete DB records
  for (const sub of allSubmissions) {
    if (Array.isArray(sub.files)) {
      for (const file of sub.files) {
        if (file.path) {
          try {
            const { error: delError } = await supabase.storage
              .from("drops")
              .remove([file.path]);
            if (!delError) deletedFiles++;
          } catch (e) {
            console.error(`Failed to delete file ${file.path}:`, e);
          }
        }
      }
    }

    // Delete submission record
    const { error: delError } = await supabase
      .from("submissions")
      .delete()
      .eq("id", sub.id);
    if (!delError) deletedSubmissions++;
  }

  return { deletedSubmissions, deletedFiles };
}

