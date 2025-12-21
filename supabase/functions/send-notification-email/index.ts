// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { initSentry } from "../_shared/sentry.ts";
import { sendEmail } from "../_shared/email.ts";

// Initialize Sentry
await initSentry();

interface RequestBody {
  submission_id: string;
  user_id: string;
}

/**
 * Render email template with variables
 */
function renderTemplate(template: string, variables: Record<string, any>): string {
  let rendered = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    rendered = rendered.replace(regex, String(value || ""));
    
    // Handle conditional blocks {{#if key}}...{{/if}}
    const ifRegex = new RegExp(`{{#if ${key}}}([\\s\\S]*?){{/if}}`, "g");
    if (value) {
      rendered = rendered.replace(ifRegex, "$1");
    } else {
      rendered = rendered.replace(ifRegex, "");
    }
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
  const templatePath = `./_shared/emails/new-submission.${type}`;
  try {
    const file = await readTextFileImpl(templatePath);
    return file;
  } catch (error) {
    console.error(`[send-notification-email] Failed to read template ${type}:`, error);
    // Fallback template
    if (type === "html") {
      return `
        <h1>New Submission Received</h1>
        <p>You've received a new submission to your drop <strong>{{drop_label}}</strong>.</p>
        <p><strong>Files:</strong> {{file_count}} file(s)</p>
        <p><a href="{{dashboard_url}}">View in Dashboard</a></p>
      `;
    } else {
      return `
New Submission Received

You've received a new submission to your drop "{{drop_label}}".
Files: {{file_count}} file(s)

View in Dashboard: {{dashboard_url}}
      `;
    }
  }
}

export async function handleSendNotificationEmailRequest(
  req: Request,
  options?: {
    supabaseUrl?: string;
    supabaseServiceRoleKey?: string;
    siteUrl?: string;
    createClientImpl?: typeof createClient;
    sendEmailImpl?: typeof sendEmail;
    readTextFileImpl?: typeof Deno.readTextFile;
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
    const body: RequestBody = await req.json();
    const { submission_id, user_id } = body;

    if (!submission_id || !user_id) {
      return new Response(
        JSON.stringify({ error: "Missing submission_id or user_id" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = options?.supabaseUrl || Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = options?.supabaseServiceRoleKey || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("[send-notification-email] Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const createClientFn = options?.createClientImpl || createClient;
    const supabase = createClientFn(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });

    // 1. Check user preferences
    const { data: preferences, error: prefError } = await supabase
      .from("user_preferences")
      .select("email_notifications")
      .eq("user_id", user_id)
      .maybeSingle();

    if (prefError) {
      console.error("[send-notification-email] Error fetching preferences:", prefError);
    }

    // Default to true if preferences not found (opt-in by default)
    const emailNotificationsEnabled = preferences?.email_notifications ?? true;

    if (!emailNotificationsEnabled) {
      console.log(`[send-notification-email] Email notifications disabled for user ${user_id}`);
      return new Response(
        JSON.stringify({ message: "Email notifications disabled", skipped: true }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    // 2. Get submission details with drop and profile info
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select(`
        id,
        created_at,
        name,
        email,
        note,
        files,
        drop_id,
        drops!inner(
          id,
          label,
          profile_id,
          last_email_sent_at,
          profiles!inner(
            id,
            user_id
          )
        )
      `)
      .eq("id", submission_id)
      .single();

    if (!submission || submissionError) {
      console.error("[send-notification-email] Error fetching submission:", submissionError);
      return new Response(
        JSON.stringify({ error: "Submission not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    // Verify the submission belongs to this user
    const profileUserId = (submission.drops as any)?.profiles?.user_id;
    if (profileUserId !== user_id) {
      console.error("[send-notification-email] Submission does not belong to user");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }

    // 3. Rate limiting: Check last email sent time for this drop (max 1 email per 5 minutes per drop)
    const FIVE_MINUTES_MS = 5 * 60 * 1000;
    const dropData = submission.drops as any;
    const lastEmailSentAt = dropData?.last_email_sent_at;
    
    if (lastEmailSentAt) {
      const now = Date.now();
      const lastEmailTime = new Date(lastEmailSentAt).getTime();
      const timeSinceLastEmail = now - lastEmailTime;

      if (timeSinceLastEmail < FIVE_MINUTES_MS) {
        const minutesSinceLastEmail = Math.floor(timeSinceLastEmail / (60 * 1000));
        const minutesRemaining = Math.ceil((FIVE_MINUTES_MS - timeSinceLastEmail) / (60 * 1000));
        console.log(
          `[send-notification-email] Rate limit: last email sent ${minutesSinceLastEmail} minutes ago (${minutesRemaining} minutes remaining)`
        );
        return new Response(
          JSON.stringify({
            message: "Rate limited",
            skipped: true,
            last_email_sent_at: lastEmailSentAt,
            minutes_since_last_email: minutesSinceLastEmail,
            minutes_remaining: minutesRemaining,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    // 4. Get user email
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(user_id);

    if (userError || !user?.email) {
      console.error("[send-notification-email] Error fetching user:", userError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    // 5. Get site URL for dashboard link
    const siteUrl = options?.siteUrl || Deno.env.get("SITE_URL") || "https://onelink.app";
    const dashboardUrl = `${siteUrl}/dashboard`;
    const settingsUrl = `${siteUrl}/settings`;

    // 6. Prepare template variables
    const fileCount = Array.isArray(submission.files) ? submission.files.length : 0;
    const submittedAt = new Date(submission.created_at).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const dropLabel = (submission.drops as any)?.label || "Drop";
    const templateVars = {
      drop_label: dropLabel,
      submitter_name: submission.name || "",
      submitter_email: submission.email || "",
      note: submission.note || "",
      file_count: fileCount,
      submitted_at: submittedAt,
      dashboard_url: dashboardUrl,
      settings_url: settingsUrl,
      current_year: new Date().getFullYear(),
    };

    // 7. Load and render templates
    const readTextFileFn = options?.readTextFileImpl || Deno.readTextFile;
    const htmlTemplate = await getEmailTemplate("html", readTextFileFn);
    const textTemplate = await getEmailTemplate("text", readTextFileFn);

    const htmlContent = renderTemplate(htmlTemplate, templateVars);
    const textContent = renderTemplate(textTemplate, templateVars);

    // 8. Send email
    const sendEmailFn = options?.sendEmailImpl || sendEmail;
    const emailResult = await sendEmailFn({
      to: user.email,
      subject: `New submission: ${dropLabel}`,
      html: htmlContent,
      text: textContent,
    });

    if (!emailResult.success) {
      console.error("[send-notification-email] Failed to send email:", emailResult.error);
      return new Response(
        JSON.stringify({ error: emailResult.error || "Failed to send email" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    // 9. Update last_email_sent_at for this drop
    const nowISO = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("drops")
      .update({ last_email_sent_at: nowISO })
      .eq("id", dropData.id);

    if (updateError) {
      console.error(
        "[send-notification-email] Failed to update last_email_sent_at:",
        updateError
      );
      // Don't fail the email send if update fails, but log it
    } else {
      console.log(
        `[send-notification-email] Updated last_email_sent_at for drop ${dropData.id}`
      );
    }

    console.log(`[send-notification-email] Email sent successfully to ${user.email}`);

    return new Response(
      JSON.stringify({
        success: true,
        email_id: emailResult.id,
        sent_to: user.email,
        last_email_sent_at: nowISO,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error: any) {
    console.error("[send-notification-email] Error:", error);
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

Deno.serve((req) => handleSendNotificationEmailRequest(req));
