// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { initSentry } from "../_shared/sentry.ts";
import { sendEmail } from "../_shared/email.ts";

// Initialize Sentry
await initSentry();

/**
 * Render email template with variables
 */
function renderTemplate(template: string, variables: Record<string, any>): string {
  let rendered = template;
  
  // Process loops first (handle nested loops by processing from innermost to outermost)
  const eachRegex = /{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g;
  const loopMatches: Array<{ fullMatch: string; key: string; content: string; startIndex: number }> = [];
  let match;
  
  // Find all loop blocks
  while ((match = eachRegex.exec(template)) !== null) {
    loopMatches.push({
      fullMatch: match[0],
      key: match[1],
      content: match[2],
      startIndex: match.index,
    });
  }
  
  // Process loops from innermost (last) to outermost (first)
  for (let i = loopMatches.length - 1; i >= 0; i--) {
    const loopMatch = loopMatches[i];
    const value = variables[loopMatch.key];
    
    if (Array.isArray(value) && value.length > 0) {
      const loopContent = value.map((item: any) => {
        let itemContent = loopMatch.content;
        // Replace item properties
        for (const [itemKey, itemValue] of Object.entries(item)) {
          const itemRegex = new RegExp(`{{item\\.${itemKey}}}`, "g");
          itemContent = itemContent.replace(itemRegex, String(itemValue || ""));
        }
        // Handle nested conditionals within loops
        const nestedIfRegex = /{{#if\s+item\.(\w+)}}([\s\S]*?){{\/if}}/g;
        let nestedMatch;
        let nestedResult = itemContent;
        while ((nestedMatch = nestedIfRegex.exec(itemContent)) !== null) {
          const nestedKey = nestedMatch[1];
          const nestedValue = (item as any)[nestedKey];
          if (nestedValue) {
            nestedResult = nestedResult.replace(nestedMatch[0], nestedMatch[2]);
          } else {
            nestedResult = nestedResult.replace(nestedMatch[0], "");
          }
        }
        return nestedResult;
      }).join("");
      rendered = rendered.replace(loopMatch.fullMatch, loopContent);
    } else {
      rendered = rendered.replace(loopMatch.fullMatch, "");
    }
  }
  
  // Process conditionals
  for (const [key, value] of Object.entries(variables)) {
    const ifRegex = new RegExp(`{{#if ${key}}}([\\s\\S]*?){{/if}}`, "g");
    if (value) {
      rendered = rendered.replace(ifRegex, "$1");
    } else {
      rendered = rendered.replace(ifRegex, "");
    }
  }
  
  // Replace simple variables
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    rendered = rendered.replace(regex, String(value || ""));
  }
  
  return rendered;
}

/**
 * Get email template
 */
async function getEmailTemplate(
  type: "html" | "text",
  readTextFileImpl: typeof Deno.readTextFile = Deno.readTextFile,
): Promise<string> {
  const templatePath = `./_shared/emails/weekly-digest.${type}`;
  try {
    const file = await readTextFileImpl(templatePath);
    return file;
  } catch (error) {
    console.error(`[send-weekly-digest] Failed to read template ${type}:`, error);
    // Fallback template
    if (type === "html") {
      return `
        <h1>Your Weekly Digest</h1>
        <p>Here's a summary of your submissions from the past week:</p>
        <p><strong>Total Submissions:</strong> {{total_submissions}}</p>
        <p><strong>Total Files:</strong> {{total_files}}</p>
        <p><a href="{{dashboard_url}}">View in Dashboard</a></p>
      `;
    } else {
      return `
Your Weekly Digest

Here's a summary of your submissions from the past week:
Total Submissions: {{total_submissions}}
Total Files: {{total_files}}

View in Dashboard: {{dashboard_url}}
      `;
    }
  }
}

/**
 * Get submissions from the past week for a user
 */
async function getWeeklySubmissions(
  supabase: any,
  userId: string,
  weekStart: Date,
  weekEnd: Date,
): Promise<any[]> {
  // First, get all profiles for this user
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId);

  if (profilesError || !profiles || profiles.length === 0) {
    console.log(`[send-weekly-digest] No profiles found for user ${userId}`);
    return [];
  }

  const profileIds = profiles.map((p: any) => p.id);

  // Get all drops for these profiles
  const { data: drops, error: dropsError } = await supabase
    .from("drops")
    .select("id, label, profile_id")
    .in("profile_id", profileIds);

  if (dropsError || !drops || drops.length === 0) {
    console.log(`[send-weekly-digest] No drops found for user ${userId}`);
    return [];
  }

  const dropIds = drops.map((d: any) => d.id);
  const dropMap = new Map(drops.map((d: any) => [d.id, d]));

  // Get submissions for these drops
  const { data: submissions, error: submissionsError } = await supabase
    .from("submissions")
    .select("id, created_at, name, email, note, files, drop_id")
    .in("drop_id", dropIds)
    .gte("created_at", weekStart.toISOString())
    .lt("created_at", weekEnd.toISOString())
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (submissionsError) {
    console.error(`[send-weekly-digest] Error fetching submissions for user ${userId}:`, submissionsError);
    return [];
  }

  // Attach drop information to each submission
  return (submissions || []).map((submission: any) => ({
    ...submission,
    drops: dropMap.get(submission.drop_id),
  }));
}

/**
 * Aggregate submissions by drop
 */
function aggregateSubmissionsByDrop(submissions: any[]): Array<{
  drop_label: string;
  drop_id: string;
  count: number;
  files_count: number;
  submissions: Array<{
    created_at: string;
    name: string | null;
    email: string | null;
    file_count: number;
  }>;
}> {
  const dropMap = new Map<string, any>();

  for (const submission of submissions) {
    const drop = submission.drops as any;
    const dropId = drop.id;
    const dropLabel = drop.label || "Unnamed Drop";

    if (!dropMap.has(dropId)) {
      dropMap.set(dropId, {
        drop_label: dropLabel,
        drop_id: dropId,
        count: 0,
        files_count: 0,
        submissions: [],
      });
    }

    const dropData = dropMap.get(dropId);
    const fileCount = Array.isArray(submission.files) ? submission.files.length : 0;

    dropData.count += 1;
    dropData.files_count += fileCount;
    dropData.submissions.push({
      created_at: submission.created_at,
      name: submission.name,
      email: submission.email,
      file_count: fileCount,
    });
  }

  return Array.from(dropMap.values());
}

/**
 * Send weekly digest to a single user
 */
async function sendDigestToUser(
  supabase: any,
  userId: string,
  weekStart: Date,
  weekEnd: Date,
  options?: {
    siteUrl?: string;
    sendEmailImpl?: typeof sendEmail;
    readTextFileImpl?: typeof Deno.readTextFile;
    getWeeklySubmissionsImpl?: typeof getWeeklySubmissions;
  },
): Promise<{ success: boolean; error?: string; skipped?: boolean }> {
  // Get user email
  const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);

  if (userError || !user?.email) {
    console.error(`[send-weekly-digest] Error fetching user ${userId}:`, userError);
    return { success: false, error: "User not found" };
  }

  // Get submissions from the past week
  const getWeeklySubmissionsFn = options?.getWeeklySubmissionsImpl || getWeeklySubmissions;
  const submissions = await getWeeklySubmissionsFn(supabase, userId, weekStart, weekEnd);

  // If no submissions, skip sending email
  if (submissions.length === 0) {
    console.log(`[send-weekly-digest] No submissions for user ${userId}, skipping`);
    return { success: true, skipped: true };
  }

  // Aggregate by drop
  const drops = aggregateSubmissionsByDrop(submissions);

  // Calculate totals
  const totalSubmissions = submissions.length;
  const totalFiles = submissions.reduce((sum, s) => {
    return sum + (Array.isArray(s.files) ? s.files.length : 0);
  }, 0);

  // Get site URL
  const siteUrl = options?.siteUrl || Deno.env.get("SITE_URL") || "https://onelink.app";
  const dashboardUrl = `${siteUrl}/dashboard`;
  const settingsUrl = `${siteUrl}/settings`;

  // Format date range
  const weekStartFormatted = weekStart.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const weekEndFormatted = weekEnd.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Prepare template variables
  const templateVars = {
    week_start: weekStartFormatted,
    week_end: weekEndFormatted,
    total_submissions: totalSubmissions,
    total_submissions_plural: totalSubmissions !== 1,
    total_files: totalFiles,
    total_files_plural: totalFiles !== 1,
    drops: drops.map((drop) => ({
      drop_label: drop.drop_label,
      count: drop.count,
      count_plural: drop.count !== 1,
      files_count: drop.files_count,
      files_count_plural: drop.files_count !== 1,
      submissions: drop.submissions.slice(0, 5).map((s: any) => ({
        created_at: new Date(s.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        name: s.name || "Anonymous",
        file_count: s.file_count,
        file_count_plural: s.file_count !== 1,
      })),
      has_more: drop.submissions.length > 5,
      more_count: drop.submissions.length - 5,
      more_count_plural: (drop.submissions.length - 5) !== 1,
    })),
    dashboard_url: dashboardUrl,
    settings_url: settingsUrl,
    current_year: new Date().getFullYear(),
  };

  // Load and render templates
  const readTextFileFn = options?.readTextFileImpl || Deno.readTextFile;
  const htmlTemplate = await getEmailTemplate("html", readTextFileFn);
  const textTemplate = await getEmailTemplate("text", readTextFileFn);

  const htmlContent = renderTemplate(htmlTemplate, templateVars);
  const textContent = renderTemplate(textTemplate, templateVars);

  // Send email
  const sendEmailFn = options?.sendEmailImpl || sendEmail;
  const emailResult = await sendEmailFn({
    to: user.email,
    subject: `Your Weekly Digest - ${totalSubmissions} new submission${totalSubmissions !== 1 ? "s" : ""}`,
    html: htmlContent,
    text: textContent,
  });

  if (!emailResult.success) {
    console.error(`[send-weekly-digest] Failed to send email to ${user.email}:`, emailResult.error);
    return { success: false, error: emailResult.error || "Failed to send email" };
  }

  console.log(`[send-weekly-digest] Email sent successfully to ${user.email}`);
  return { success: true };
}

export async function handleSendWeeklyDigestRequest(
  req: Request,
  options?: {
    supabaseUrl?: string;
    supabaseServiceRoleKey?: string;
    siteUrl?: string;
    createClientImpl?: typeof createClient;
    sendEmailImpl?: typeof sendEmail;
    readTextFileImpl?: typeof Deno.readTextFile;
    getWeeklySubmissionsImpl?: typeof getWeeklySubmissions;
    sendDigestToUserImpl?: typeof sendDigestToUser;
  },
): Promise<Response> {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const supabaseUrl = options?.supabaseUrl || Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = options?.supabaseServiceRoleKey || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("[send-weekly-digest] Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const createClientFn = options?.createClientImpl || createClient;
    const supabase = createClientFn(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });

    // Calculate week range (last 7 days, ending at start of today)
    const now = new Date();
    const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 7); // 7 days ago

    console.log(`[send-weekly-digest] Processing weekly digest for ${weekStart.toISOString()} to ${weekEnd.toISOString()}`);

    // Get all users with weekly_digest enabled
    const { data: preferences, error: prefError } = await supabase
      .from("user_preferences")
      .select("user_id")
      .eq("weekly_digest", true);

    if (prefError) {
      console.error("[send-weekly-digest] Error fetching preferences:", prefError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch user preferences" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    if (!preferences || preferences.length === 0) {
      console.log("[send-weekly-digest] No users with weekly_digest enabled");
      return new Response(
        JSON.stringify({ message: "No users to process", processed: 0 }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    console.log(`[send-weekly-digest] Found ${preferences.length} users with weekly_digest enabled`);

    // Process each user
    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
    };

    const sendDigestToUserFn = options?.sendDigestToUserImpl || sendDigestToUser;
    for (const pref of preferences) {
      try {
        const result = await sendDigestToUserFn(
          supabase,
          pref.user_id,
          weekStart,
          weekEnd,
          {
            siteUrl: options?.siteUrl,
            sendEmailImpl: options?.sendEmailImpl,
            readTextFileImpl: options?.readTextFileImpl,
            getWeeklySubmissionsImpl: options?.getWeeklySubmissionsImpl,
          },
        );

        results.processed += 1;
        if (result.success) {
          if ((result as any).skipped) {
            results.skipped += 1;
          } else {
            results.succeeded += 1;
          }
        } else {
          results.failed += 1;
          if (result.error) {
            results.errors.push(`${pref.user_id}: ${result.error}`);
          }
        }
      } catch (error: any) {
        results.processed += 1;
        results.failed += 1;
        results.errors.push(`${pref.user_id}: ${error.message || "Unknown error"}`);
        console.error(`[send-weekly-digest] Error processing user ${pref.user_id}:`, error);
      }
    }

    console.log(`[send-weekly-digest] Completed: ${results.succeeded} succeeded, ${results.skipped} skipped, ${results.failed} failed`);

    return new Response(
      JSON.stringify(results),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error: any) {
    console.error("[send-weekly-digest] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
}

// Initialize Sentry before starting the server
await initSentry();

Deno.serve((req) => handleSendWeeklyDigestRequest(req));
