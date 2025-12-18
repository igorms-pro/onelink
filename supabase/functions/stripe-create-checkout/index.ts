// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@^16.0.0";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { initSentry } from "../_shared/sentry.ts";

// Initialize Sentry (will only initialize once, even if called multiple times)
await initSentry();

// CORS headers helper
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  console.log("[stripe-create-checkout] Request received:", req.method, req.url);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("[stripe-create-checkout] CORS preflight");
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    console.log("[stripe-create-checkout] Method not allowed:", req.method);
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const siteUrl = Deno.env.get("SITE_URL");
  
  console.log("[stripe-create-checkout] Env check:", {
    hasStripeKey: !!stripeKey,
    hasSiteUrl: !!siteUrl,
  });

  if (!stripeKey || !siteUrl) {
    console.error("[stripe-create-checkout] Missing required env vars");
    return new Response("Server configuration error", {
      status: 500,
      headers: corsHeaders,
    });
  }

  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.replace("Bearer ", "");
  
  console.log("[stripe-create-checkout] Auth check:", {
    hasAuthHeader: !!authHeader,
    hasJWT: !!jwt,
    jwtLength: jwt.length,
  });
  
  if (!jwt) {
    console.log("[stripe-create-checkout] No JWT provided");
    return new Response("Unauthorized", {
      status: 401,
      headers: corsHeaders,
    });
  }

  const body = await req.json();
  const plan = body?.plan || "pro"; // "starter" or "pro"
  const period = body?.period || "monthly"; // "monthly" or "yearly"

  console.log("[stripe-create-checkout] Request body:", { plan, period });

  // Get the correct price ID based on plan and period
  const priceIdKey = `PRICE_ID_${plan.toUpperCase()}_${period.toUpperCase()}`;
  const priceId = Deno.env.get(priceIdKey);
  
  console.log("[stripe-create-checkout] Price ID lookup:", {
    key: priceIdKey,
    found: !!priceId,
  });
  
  if (!priceId) {
    console.error("[stripe-create-checkout] Price ID not found:", priceIdKey);
    return new Response(`Price ID not found for ${plan} ${period}`, {
      status: 400,
      headers: corsHeaders,
    });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

  try {
    // Extract Supabase URL from request URL
    const requestUrl = new URL(req.url);
    const supabaseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    
    console.log("[stripe-create-checkout] Supabase URL:", supabaseUrl);
    
    // Get anon key from environment or use service role key
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log("[stripe-create-checkout] Supabase key check:", {
      hasAnonKey: !!Deno.env.get("SUPABASE_ANON_KEY"),
      hasServiceRoleKey: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
      usingKey: supabaseAnonKey ? "found" : "missing",
    });
    
    if (!supabaseAnonKey) {
      console.error("[stripe-create-checkout] No Supabase key available");
      return new Response("Server configuration error: Missing Supabase key", {
        status: 500,
        headers: corsHeaders,
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    console.log("[stripe-create-checkout] Verifying user with JWT...");
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);

    if (userError) {
      console.error("[stripe-create-checkout] User verification error:", userError.message);
      return new Response("Unauthorized", {
        status: 401,
        headers: corsHeaders,
      });
    }

    if (!user) {
      console.error("[stripe-create-checkout] No user found");
      return new Response("Unauthorized", {
        status: 401,
        headers: corsHeaders,
      });
    }

    console.log("[stripe-create-checkout] User verified:", {
      userId: user.id,
      email: user.email,
    });

    const email = user.email;
    const user_id = user.id;

    if (!email || !user_id) {
      console.error("[stripe-create-checkout] Missing user data:", { email: !!email, userId: !!user_id });
      return new Response("Unauthorized", {
        status: 401,
        headers: corsHeaders,
      });
    }

    console.log("[stripe-create-checkout] Looking up Stripe customer...");
    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0] || await stripe.customers.create({ 
      email,
      metadata: { user_id } // Link user_id to customer
    });
    
    console.log("[stripe-create-checkout] Stripe customer:", {
      customerId: customer.id,
      isNew: !customers.data[0],
    });

    // Check if customer already has an active subscription
    console.log("[stripe-create-checkout] Checking for existing subscriptions...");
    const existingSubscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "active",
      limit: 1,
    });

    if (existingSubscriptions.data.length > 0) {
      console.log("[stripe-create-checkout] Customer already has active subscription:", {
        subscriptionId: existingSubscriptions.data[0].id,
      });
      return new Response(
        JSON.stringify({ 
          error: "You already have an active subscription. Please manage it from the billing portal.",
          code: "SUBSCRIPTION_EXISTS"
        }), 
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("[stripe-create-checkout] Creating checkout session...");
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/dashboard?upgraded=1`,
      cancel_url: `${siteUrl}/dashboard?canceled=1`,
      subscription_data: {
        metadata: { user_id, plan, period }, // Also add metadata to subscription
      },
      metadata: { user_id, plan, period },
    });

    console.log("[stripe-create-checkout] Checkout session created:", {
      sessionId: session.id,
      url: session.url ? "present" : "missing",
    });

    return Response.json({ url: session.url }, { headers: corsHeaders });
  } catch (e: any) {
    console.error("[stripe-create-checkout] Error:", e.message, e.stack);
    return new Response(e?.message ?? "Stripe error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});


