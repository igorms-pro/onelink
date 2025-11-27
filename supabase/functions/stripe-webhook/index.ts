// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@^16.0.0";

Deno.serve(async (req) => {
  console.log("[stripe-webhook] Request received");
  
  const sig = req.headers.get("stripe-signature") || "";
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  
  console.log("[stripe-webhook] Env check:", {
    hasWebhookSecret: !!webhookSecret,
    hasStripeKey: !!stripeKey,
    hasSig: !!sig,
  });
  
  if (!webhookSecret || !stripeKey) {
    console.error("[stripe-webhook] Missing env vars");
    return new Response("Server configuration error", { status: 500 });
  }
  
  const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

  const body = await req.text();
  let event: Stripe.Event;

  try {
    // Use constructEventAsync for Deno/Edge runtime
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
    console.log("[stripe-webhook] Event verified:", event.type);
  } catch (err: any) {
    console.error("[stripe-webhook] Signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  console.log("[stripe-webhook] Supabase check:", {
    hasUrl: !!supabaseUrl,
    hasServiceRole: !!serviceRole,
  });

  async function updateUserPlan(userId: string, plan: string, stripeId?: string | null) {
    console.log("[stripe-webhook] Updating user plan:", { userId, plan, stripeId });
    
    const url = `${supabaseUrl}/rest/v1/profiles?user_id=eq.${userId}`;
    const updateData: { plan: string; stripe_id?: string | null } = { plan };
    if (stripeId) {
      updateData.stripe_id = stripeId;
    }
    
    console.log("[stripe-webhook] PATCH URL:", url);
    console.log("[stripe-webhook] Update data:", updateData);
    
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${serviceRole}`,
        "apikey": serviceRole,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify(updateData),
    });
    
    const responseText = await response.text();
    console.log("[stripe-webhook] Update response:", response.status, responseText);
    
    if (!response.ok) {
      throw new Error(`Failed to update user plan: ${response.status} ${responseText}`);
    }
    
    return responseText;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = (session.metadata as any)?.user_id;
        const plan = (session.metadata as any)?.plan || "starter";
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        
        console.log("[stripe-webhook] checkout.session.completed:", { userId, plan, customerId });
        
        if (userId) {
          await updateUserPlan(userId, plan, customerId || undefined);
          
          // Tag subscription with user_id for future events
          const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
          if (subscriptionId) {
            try {
              await stripe.subscriptions.update(subscriptionId, {
                metadata: { user_id: userId, plan },
              });
              console.log("[stripe-webhook] Subscription metadata updated:", subscriptionId);
            } catch (e: any) {
              console.error("[stripe-webhook] Failed to update subscription metadata:", e.message);
            }
          }
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = (sub.metadata as any)?.user_id;
        const plan = (sub.metadata as any)?.plan || "starter";
        const status = sub.status;
        const effectivePlan = status === "active" || status === "trialing" ? plan : "free";
        
        console.log("[stripe-webhook] subscription event:", { type: event.type, userId, plan, status, effectivePlan });
        
        if (userId) await updateUserPlan(userId, effectivePlan);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = (sub.metadata as any)?.user_id;
        
        console.log("[stripe-webhook] subscription.deleted:", { userId });
        
        if (userId) await updateUserPlan(userId, "free");
        break;
      }
      default:
        console.log("[stripe-webhook] Unhandled event type:", event.type);
        break;
    }
  } catch (e: any) {
    console.error("[stripe-webhook] Error handling event:", e.message, e.stack);
    return new Response(e?.message ?? "Webhook handling failed", { status: 500 });
  }

  console.log("[stripe-webhook] Success");
  return new Response("ok", { status: 200 });
});


