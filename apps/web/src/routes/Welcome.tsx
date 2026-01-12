import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthProvider";
import { useUsernameAvailability } from "../hooks/useUsernameAvailability";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { HeaderMobileSignIn } from "../components/HeaderMobileSignIn";
import { Footer } from "@/components/Footer";

const USERNAME_STORAGE_KEY = "onelink_pending_username";

export default function Welcome() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load username from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(USERNAME_STORAGE_KEY);
    if (stored) {
      setUsername(stored.trim().toLowerCase());
    }
  }, []);

  // Check username availability
  const {
    available,
    checking,
    error: availabilityError,
  } = useUsernameAvailability(username);

  // Determine if the form can be submitted
  const canSubmit =
    username.trim().length >= 3 &&
    username.trim().length <= 30 &&
    available === true &&
    !checking &&
    !loading &&
    !error;

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit || !user) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const normalizedUsername = username.trim().toLowerCase();

      // Call Edge Function to create profile
      const { data, error: functionError } = await supabase.functions.invoke<{
        success: boolean;
        profile?: {
          id: string;
          user_id: string;
          slug: string;
        };
        error?: string;
        message?: string;
      }>("create-profile", {
        method: "POST",
        body: { username: normalizedUsername },
      });

      if (functionError) {
        console.error("[Welcome] Edge function error:", functionError);
        setError(functionError.message || t("welcome_error_create_failed"));
        toast.error(functionError.message || t("welcome_error_create_failed"));
        return;
      }

      if (!data?.success) {
        const errorMessage =
          data?.message || data?.error || t("welcome_error_create_failed");
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      // Clear stored username
      localStorage.removeItem(USERNAME_STORAGE_KEY);

      // Show success message
      toast.success(t("welcome_profile_created"));

      // Redirect to dashboard
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("welcome_error_create_failed");
      console.error("[Welcome] Unexpected error:", err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get availability indicator
  const getAvailabilityIndicator = () => {
    if (checking) {
      return (
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          ⏳ {t("welcome_checking")}
        </span>
      );
    }

    if (availabilityError) {
      return (
        <span className="text-red-500 dark:text-red-400 text-sm">
          ✗ {availabilityError}
        </span>
      );
    }

    if (username.trim().length === 0) {
      return null;
    }

    if (username.trim().length < 3 || username.trim().length > 30) {
      return null; // Validation error will be shown by availabilityError
    }

    if (available === true) {
      return (
        <span className="text-green-600 dark:text-green-400 text-sm">
          ✓ {t("welcome_available")}
        </span>
      );
    }

    if (available === false) {
      return (
        <span className="text-red-500 dark:text-red-400 text-sm">
          ✗ {t("welcome_taken")}
        </span>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors relative">
      {/* Background image - light mode */}
      <div
        className="absolute inset-0 pointer-events-none dark:hidden"
        style={{
          backgroundImage: "url(/screen.png)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      ></div>

      {/* Background image - dark mode */}
      <div
        className="absolute inset-0 pointer-events-none hidden dark:block"
        style={{
          backgroundImage: "url(/screen-dark.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      ></div>

      <HeaderMobileSignIn />
      <main className="flex-1 mx-auto max-w-md w-full p-6 flex flex-col justify-center relative z-10">
        <div className="flex flex-col justify-center text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/onelink-logo.png"
              alt="OneLink"
              className="h-20 sm:h-24 w-auto object-contain dark:hidden"
            />
            <img
              src="/onelink-logo-white.png"
              alt="OneLink"
              className="h-20 sm:h-24 w-auto object-contain hidden dark:block"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("welcome_title")}
          </h1>

          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-8">
            {t("welcome_description")}
          </p>

          {/* Username form */}
          <form
            className="grid gap-3 max-w-sm mx-auto w-full"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm pointer-events-none">
                  app.getonelink.io/
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    const value = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9_-]/g, "");
                    setUsername(value);
                    setError(null);
                  }}
                  placeholder={t("welcome_username_placeholder")}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pl-46 pr-4 py-3.5 text-base placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all"
                  disabled={loading}
                  autoFocus
                  minLength={3}
                  maxLength={30}
                />
              </div>

              {/* Availability indicator */}
              <div className="min-h-[20px] flex items-center justify-center">
                {getAvailabilityIndicator()}
              </div>

              {/* Help text */}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("welcome_help_text")}
              </p>

              {/* Error message */}
              {error && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-xl bg-linear-to-r from-purple-500 to-purple-600 text-white px-8 py-3.5 text-base font-medium hover:from-purple-600 hover:to-purple-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg"
            >
              {loading ? t("welcome_creating") : t("welcome_continue")}
            </button>
          </form>
        </div>
      </main>
      <Footer className="relative z-10" />
    </div>
  );
}
