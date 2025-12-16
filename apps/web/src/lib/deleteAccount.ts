import { supabase } from "./supabase";

type DeleteAccountResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  stats?: unknown;
};

export async function deleteAccount({ mfaCode }: { mfaCode: string }): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { data, error } =
      await supabase.functions.invoke<DeleteAccountResponse>("delete-account", {
        method: "POST",
        body: { mfa_code: mfaCode },
      });

    if (error) {
      console.error("[deleteAccount] Edge function error:", error);
      return {
        success: false,
        error: error.message ?? "Failed to delete account",
      };
    }

    if (!data?.success) {
      const message =
        data?.message || data?.error || "Failed to delete account";
      console.error("[deleteAccount] Edge function returned failure:", data);
      return {
        success: false,
        error: message,
      };
    }

    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete account";
    console.error("[deleteAccount] Unexpected error:", err);
    return { success: false, error: message };
  }
}
