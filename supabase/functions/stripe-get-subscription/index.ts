// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@^16.0.0";
import { createClient } from "jsr:@supabase/supabase-js@2";

// CORS headers helper
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (req) => {
  console.log("[stripe-get-subscription] Request received:", req.method, req.url);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("[stripe-get-subscription] CORS preflight");
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    console.log("[stripe-get-subscription] Method not allowed:", req.method);
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  console.log("[stripe-get-subscription] Env check:", {
    hasStripeKey: !!stripeKey,
    hasSupabaseUrl: !!supabaseUrl,
    hasServiceRoleKey: !!supabaseServiceRoleKey,
  });

  if (!stripeKey || !supabaseUrl || !supabaseServiceRoleKey) {
    console.error("[stripe-get-subscription] Missing required env vars");
    return new Response("Server configuration error", {
      status: 500,
      headers: corsHeaders,
    });
  }

  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.replace("Bearer ", "");

  console.log("[stripe-get-subscription] Auth check:", {
    hasAuthHeader: !!authHeader,
    hasJWT: !!jwt,
  });

  if (!jwt) {
    console.log("[stripe-get-subscription] No JWT provided");
    return new Response("Unauthorized", {
      status: 401,
      headers: corsHeaders,
    });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    // Verify JWT and get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(jwt);

    if (authError || !user) {
      console.error("[stripe-get-subscription] Auth error:", authError);
      return new Response("Unauthorized", {
        status: 401,
        headers: corsHeaders,
      });
    }

    console.log("[stripe-get-subscription] User authenticated:", user.id);

    // Get user's profile to find stripe_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_id")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      console.error("[stripe-get-subscription] Profile error:", profileError);
      return new Response("Profile not found", {
        status: 404,
        headers: corsHeaders,
      });
    }

    if (!profile?.stripe_id) {
      console.log("[stripe-get-subscription] No stripe_id found");
      return Response.json(
        {
          subscription: null,
          invoices: [],
          paymentMethods: [],
        },
        { headers: corsHeaders },
      );
    }

    console.log("[stripe-get-subscription] Stripe customer ID:", profile.stripe_id);

    // Get subscription details
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_id,
      status: "all",
      limit: 1,
    });

    const activeSubscription = subscriptions.data.find(
      (sub) => sub.status === "active" || sub.status === "trialing",
    );

    let subscriptionDetails = null;
    if (activeSubscription) {
      const currentPeriodEnd = new Date(
        activeSubscription.current_period_end * 1000,
      ).toISOString();
      subscriptionDetails = {
        renewalDate: currentPeriodEnd,
        status: activeSubscription.status as "active" | "canceled" | "past_due",
        currentPeriodEnd,
        cancelAtPeriodEnd: activeSubscription.cancel_at_period_end,
      };
    }

    // Get invoices
    const invoices = await stripe.invoices.list({
      customer: profile.stripe_id,
      limit: 10,
    });

    const formattedInvoices = invoices.data.map((invoice) => ({
      id: invoice.id,
      amount: invoice.amount_paid || invoice.amount_due,
      currency: invoice.currency,
      status: invoice.status as "paid" | "open" | "void",
      created: invoice.created,
      invoicePdf: invoice.invoice_pdf || undefined,
      hostedInvoiceUrl: invoice.hosted_invoice_url || undefined,
    }));

    // Get payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: profile.stripe_id,
      type: "card",
    });

    const formattedPaymentMethods = paymentMethods.data.map((pm) => {
      if (pm.type === "card" && pm.card) {
        return {
          id: pm.id,
          type: "card" as const,
          card: {
            brand: pm.card.brand,
            last4: pm.card.last4,
            expMonth: pm.card.exp_month,
            expYear: pm.card.exp_year,
          },
        };
      }
      return null;
    }).filter((pm) => pm !== null);

    console.log("[stripe-get-subscription] Success:", {
      hasSubscription: !!subscriptionDetails,
      invoiceCount: formattedInvoices.length,
      paymentMethodCount: formattedPaymentMethods.length,
    });

    return Response.json(
      {
        subscription: subscriptionDetails,
        invoices: formattedInvoices,
        paymentMethods: formattedPaymentMethods,
      },
      { headers: corsHeaders },
    );
  } catch (e: any) {
    console.error("[stripe-get-subscription] Error:", e);
    return new Response(e?.message ?? "Stripe API error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});

