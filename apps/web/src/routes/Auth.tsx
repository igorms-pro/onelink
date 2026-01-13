import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../lib/AuthProvider";
import { toast } from "sonner";
import { HeaderMobileSignIn } from "../components/HeaderMobileSignIn";
import { setOnboardingIncomplete } from "../lib/onboarding";
import { Footer } from "@/components/Footer";
import { logLoginAttempt } from "@/lib/sessionTracking";
import { Loader2 } from "lucide-react";

type FormValues = { email: string };

const USERNAME_STORAGE_KEY = "onelink_pending_username";

// Google icon SVG component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function Auth() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signInWithEmail, signInWithOAuth } = useAuth();
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [pendingUsername, setPendingUsername] = useState<string | null>(null);

  // Read username from URL parameter and store it
  useEffect(() => {
    const usernameParam = searchParams.get("username");
    if (usernameParam) {
      const cleanedUsername = usernameParam.trim().toLowerCase();
      localStorage.setItem(USERNAME_STORAGE_KEY, cleanedUsername);
      setPendingUsername(cleanedUsername);
    } else {
      // Check if there's a stored username from a previous visit
      const stored = localStorage.getItem(USERNAME_STORAGE_KEY);
      if (stored) {
        setPendingUsername(stored);
      }
    }
  }, [searchParams]);

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

          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-8">
            {t("app_tagline")}
          </p>

          {/* Show pending username if available */}
          {pendingUsername && (
            <div className="mb-6 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t("auth_creating_profile_for", {
                  defaultValue: "Creating profile for",
                })}
              </p>
              <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                app.getonelink.io/{pendingUsername}
              </p>
            </div>
          )}

          {/* Sign-in form */}
          <form
            className="grid gap-3 max-w-sm mx-auto w-full"
            onSubmit={handleSubmit(async (values) => {
              setLoading(true);
              const res = await signInWithEmail(values.email);
              setLoading(false);

              if (res.error) {
                toast.error(res.error);
                // Log failed login attempt
                await logLoginAttempt({
                  email: values.email,
                  status: "failed",
                });
              } else {
                toast.success(t("auth_magic_link_sent"));
                reset(); // Clear the email field
                // Note: Successful login will be logged in AuthProvider when SIGNED_IN event fires
              }
            })}
          >
            <input
              type="email"
              required
              placeholder={t("auth_email_placeholder")}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-8 py-3.5 text-base placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all"
              disabled={loading}
              {...register("email")}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-linear-to-r from-purple-500 to-purple-600 text-white px-8 py-3.5 text-base font-medium hover:from-purple-600 hover:to-purple-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg"
            >
              {loading ? t("auth_sending") : t("auth_send_link")}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 max-w-sm mx-auto">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                {t("auth_or", { defaultValue: "or" })}
              </span>
            </div>
          </div>

          {/* Google OAuth button - Following Google Branding Guidelines */}
          <div className="max-w-sm mx-auto w-full">
            <button
              type="button"
              onClick={async () => {
                setOauthLoading(true);
                const res = await signInWithOAuth("google");
                setOauthLoading(false);

                if (res.error) {
                  toast.error(res.error);
                  // Log failed login attempt
                  await logLoginAttempt({
                    email: "oauth_google",
                    status: "failed",
                  });
                }
                // OAuth redirect will happen automatically on success
              }}
              disabled={loading || oauthLoading}
              className="w-full rounded-xl bg-white dark:bg-[#131314] text-[#1F1F1F] dark:text-[#E3E3E3] text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm flex items-center justify-center py-3.5 border border-[#747775] dark:border-[#8E918F]"
              style={{
                paddingLeft: "12px",
                paddingRight: "12px",
              }}
            >
              {oauthLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2.5" />
                  <span>
                    {t("auth_oauth_loading", { defaultValue: "Connecting..." })}
                  </span>
                </>
              ) : (
                <>
                  <div className="mr-2.5">
                    <GoogleIcon className="w-5 h-5" />
                  </div>
                  <span>{t("auth_continue_with_google")}</span>
                </>
              )}
            </button>
          </div>

          {/* Link to onboarding */}
          <button
            onClick={() => {
              setOnboardingIncomplete();
              navigate("/");
            }}
            className="mt-4 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors underline underline-offset-2 cursor-pointer"
          >
            {t("auth_view_onboarding")}
          </button>
        </div>
      </main>
      <Footer className="relative z-10" />
    </div>
  );
}
