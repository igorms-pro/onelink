import { supabase } from "./supabase";

export async function goToCheckout(): Promise<void> {
  const token = (await supabase.auth.getSession()).data.session?.access_token;
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-create-checkout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (data?.url) window.location.href = data.url;
}

export async function goToPortal(): Promise<void> {
  const token = (await supabase.auth.getSession()).data.session?.access_token;
  const email = (await supabase.auth.getUser()).data.user?.email;
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-portal`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (data?.url) window.location.href = data.url;
}


