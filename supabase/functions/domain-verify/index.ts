// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const vercelToken = Deno.env.get("VERCEL_TOKEN");
  const vercelProjectId = Deno.env.get("VERCEL_PROJECT_ID");

  if (!supabaseUrl || !serviceRole || !vercelToken || !vercelProjectId) {
    return new Response("Missing required environment variables", { status: 500 });
  }

  async function fetchUnverifiedDomains(): Promise<string[]> {
    const url = new URL("/rest/v1/custom_domains", supabaseUrl);
    url.searchParams.set("verified", "is.false");
    url.searchParams.set("select", "domain");
    const res = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${serviceRole}`,
        "apikey": serviceRole,
      },
    });
    if (!res.ok) throw new Error(`Failed to fetch custom_domains: ${res.status}`);
    const rows = await res.json();
    return (rows || []).map((r: any) => r.domain).filter(Boolean);
  }

  async function isDomainValidInVercel(domain: string): Promise<boolean> {
    const url = `https://api.vercel.com/v9/projects/${vercelProjectId}/domains/${domain}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
    });
    if (res.status === 404) return false;
    if (!res.ok) throw new Error(`Vercel API error ${res.status} for ${domain}`);
    const data = await res.json();
    // Heuristics: consider valid when Vercel marks the domain as configured and verified/valid
    const configured = data?.configured === true || data?.misconfigured === false;
    const verified = data?.verified === true || data?.verification?.status === "completed";
    const valid = data?.valid === true || data?.redirect === false; // some responses include "valid"
    return Boolean((configured && (verified || valid)) || data?.uid);
  }

  async function markVerified(domain: string): Promise<void> {
    const url = new URL("/rest/v1/custom_domains", supabaseUrl);
    url.searchParams.set("domain", `eq.${domain}`);
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${serviceRole}`,
        "apikey": serviceRole,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
      },
      body: JSON.stringify({ verified: true }),
    });
    if (!res.ok) throw new Error(`Failed to update verified for ${domain}: ${res.status}`);
  }

  try {
    const domains = await fetchUnverifiedDomains();
    let checked = 0;
    let updated = 0;
    const errors: Record<string, string> = {};

    for (const d of domains) {
      try {
        checked++;
        const ok = await isDomainValidInVercel(d);
        if (ok) {
          await markVerified(d);
          updated++;
        }
      } catch (e: any) {
        errors[d] = e?.message ?? String(e);
      }
    }

    return Response.json({ checked, updated, errors });
  } catch (e: any) {
    return new Response(e?.message ?? "domain verify failed", { status: 500 });
  }
});
