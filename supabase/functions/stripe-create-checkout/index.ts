// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@^16.0.0";

// CORS headers helper
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;
  const siteUrl = Deno.env.get("SITE_URL")!;

  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.replace("Bearer ", "");
  if (!jwt) {
    return new Response("Unauthorized", {
      status: 401,
      headers: corsHeaders,
    });
  }

  const body = await req.json();
  const plan = body?.plan || "pro"; // "starter" or "pro"
  const period = body?.period || "monthly"; // "monthly" or "yearly"

  // Get the correct price ID based on plan and period
  const priceIdKey = `PRICE_ID_${plan.toUpperCase()}_${period.toUpperCase()}`;
  const priceId = Deno.env.get(priceIdKey);
  
  if (!priceId) {
    return new Response(`Price ID not found for ${plan} ${period}`, {
      status: 400,
      headers: corsHeaders,
    });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

  try {
    const { email, user_id } = (await (await fetch(
      new URL("/auth/v1/user", Deno.env.get("SUPA_DATABASE_URL")!).toString(),
      {
        headers: {
          "Authorization": `Bearer ${jwt}`,
          "apikey": Deno.env.get("SUPABASE_ANON_KEY")!,
        },
      }
    )).json()).user || {};

    if (!email || !user_id) {
      return new Response("Unauthorized", {
        status: 401,
        headers: corsHeaders,
      });
    }

    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0] || await stripe.customers.create({ email });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/dashboard?upgraded=1`,
      cancel_url: `${siteUrl}/dashboard?canceled=1`,
      metadata: { user_id, plan, period },
    });

    return Response.json({ url: session.url }, { headers: corsHeaders });
  } catch (e: any) {
    return new Response(e?.message ?? "Stripe error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});


