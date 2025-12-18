/**
 * Email utility functions for Supabase Edge Functions
 * Uses Resend API for sending transactional emails
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using Resend API
 */
export async function sendEmail(options: EmailOptions): Promise<{
  success: boolean;
  error?: string;
  id?: string;
}> {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

  if (!RESEND_API_KEY) {
    console.error("[email] RESEND_API_KEY not configured");
    return {
      success: false,
      error: "Email service not configured",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "OneLink <onboarding@resend.dev>", // TODO: Update with verified domain
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || stripHtml(options.html),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[email] Resend API error:", data);
      return {
        success: false,
        error: data.message || "Failed to send email",
      };
    }

    console.log("[email] Email sent successfully:", data.id);
    return {
      success: true,
      id: data.id,
    };
  } catch (error: any) {
    console.error("[email] Error sending email:", error);
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Strip HTML tags to create plain text version
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}
