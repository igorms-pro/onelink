import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
  {
    auth: {
      flowType: "pkce", // Use PKCE flow for enhanced security
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true, // Automatically exchange code for session
    },
  },
);
