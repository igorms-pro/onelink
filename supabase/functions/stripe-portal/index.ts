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

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

  try {
    const { email } = await req.json();
    if (!email) {
      return new Response("Email required", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0];
    if (!customer) {
      return new Response("No customer", {
        status: 404,
        headers: corsHeaders,
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${siteUrl}/dashboard`,
    });

    return Response.json({ url: session.url }, { headers: corsHeaders });
  } catch (e: any) {
    return new Response(e?.message ?? "Stripe portal error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});


