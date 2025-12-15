import { supabase } from "../supabase";
import { BillingError } from "./errors";
import { handleHttpError, handleError } from "./httpUtils";
import type { SubscriptionData, SubscriptionDetails } from "./types";

export async function getSubscriptionData(): Promise<SubscriptionData> {
  const token = (await supabase.auth.getSession()).data.session?.access_token;

  if (!token) {
    throw new BillingError("Authentication required", "AUTH_REQUIRED");
  }

  try {
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-get-subscription`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) {
      await handleHttpError(res);
    }

    const data = await res.json();
    return data as SubscriptionData;
  } catch (error) {
    handleError(error);
  }
}

export async function getSubscriptionDetails(): Promise<SubscriptionDetails | null> {
  const data = await getSubscriptionData();
  return data.subscription;
}
