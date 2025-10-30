// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@^16.0.0";

const textDecoder = new TextDecoder();

Deno.serve(async (req) => {
  const sig = req.headers.get("stripe-signature") || "";
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });

  const body = await req.arrayBuffer();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(new Uint8Array(body), sig, webhookSecret);
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  async function updateUserPlan(userId: string, plan: string, status: string, expiresAt?: string | null) {
    await fetch(new URL("/rest/v1/users", supabaseUrl), {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${serviceRole}`,
        "apikey": serviceRole,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify({ plan, status, expires_at: expiresAt }),
    });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = (session.metadata as any)?.user_id;
        if (userId) {
          await updateUserPlan(userId, "pro", "active", null);
          // Ensure the created subscription is tagged with user_id for future events
          const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
          if (subscriptionId) {
            try {
              await stripe.subscriptions.update(subscriptionId, {
                metadata: { user_id: userId },
              });
            } catch (_) {
              // ignore metadata update failures
            }
          }
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = (sub.metadata as any)?.user_id;
        const status = sub.status;
        const plan = status === "active" || status === "trialing" ? "pro" : "free";
        const expiresAt = sub.cancel_at ? new Date(sub.cancel_at * 1000).toISOString() : null;
        if (userId) await updateUserPlan(userId, plan, status, expiresAt);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = (sub.metadata as any)?.user_id;
        if (userId) await updateUserPlan(userId, "free", "canceled", new Date().toISOString());
        break;
      }
      default:
        break;
    }
  } catch (e: any) {
    return new Response(e?.message ?? "Webhook handling failed", { status: 500 });
  }

  return new Response("ok", { status: 200 });
});


