// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@^16.0.0";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;
  const priceId = Deno.env.get("PRICE_ID")!;
  const siteUrl = Deno.env.get("SITE_URL")!;

  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.replace("Bearer ", "");
  if (!jwt) return new Response("Unauthorized", { status: 401 });

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

  try {
    const { email, user_id } = (await (await fetch(
      new URL("/auth/v1/user", Deno.env.get("SUPABASE_URL")!).toString(),
      {
        headers: {
          "Authorization": `Bearer ${jwt}`,
          "apikey": Deno.env.get("SUPABASE_ANON_KEY")!,
        },
      }
    )).json()).user || {};

    if (!email || !user_id) return new Response("Unauthorized", { status: 401 });

    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0] || await stripe.customers.create({ email });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/dashboard?upgraded=1`,
      cancel_url: `${siteUrl}/dashboard?canceled=1`,
      metadata: { user_id },
    });

    return Response.json({ url: session.url });
  } catch (e: any) {
    return new Response(e?.message ?? "Stripe error", { status: 500 });
  }
});


