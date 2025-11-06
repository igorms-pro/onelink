import { useForm } from "react-hook-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../lib/AuthProvider";
import { toast } from "sonner";
import { HeaderMobileSignIn } from "../components/HeaderMobileSignIn";

type FormValues = { email: string };

export default function Auth() {
  const { t } = useTranslation();
  const { signInWithEmail } = useAuth();
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors relative">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

      {/* Purple blob gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-purple-300/8 dark:bg-purple-500/4 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-purple-200/6 dark:bg-purple-400/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-300/8 dark:bg-purple-500/4 rounded-full blur-3xl"></div>
      </div>

      <HeaderMobileSignIn />
      <main className="flex-1 mx-auto max-w-md w-full p-6 flex flex-col">
        <div className="flex-1 flex flex-col justify-center text-center">
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-4">
            {t("app_title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-8">
            {t("app_tagline")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-center mb-8">
            <a
              className="w-full sm:w-auto rounded-xl bg-purple-200/60 dark:bg-purple-300/20 text-purple-700 dark:text-purple-300 px-8 py-3.5 text-base font-medium hover:bg-purple-200/80 dark:hover:bg-purple-300/30 transition-all"
              href="/auth"
            >
              {t("sign_in")}
            </a>
            <a
              className="hidden sm:block w-auto rounded-xl border border-purple-200 dark:border-purple-600/30 bg-white/50 dark:bg-gray-800/50 px-8 py-3.5 text-base font-medium hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors text-gray-700 dark:text-gray-300"
              href="/igor"
            >
              {t("view_sample")}
            </a>
          </div>

          {/* Sign-in form */}
          <div className="rounded-xl border border-gray-200/50 dark:border-gray-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
              {t("auth_sign_in_title")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t("auth_sign_in_description")}
            </p>
            <form
              className="grid gap-3"
              onSubmit={handleSubmit(async (values) => {
                setLoading(true);
                const res = await signInWithEmail(values.email);
                setLoading(false);

                if (res.error) {
                  toast.error(res.error);
                } else {
                  toast.success(t("auth_magic_link_sent"));
                  reset(); // Clear the email field
                }
              })}
            >
              <input
                type="email"
                required
                placeholder={t("auth_email_placeholder")}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all"
                disabled={loading}
                {...register("email")}
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2.5 text-sm font-medium hover:from-purple-600 hover:to-purple-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg"
              >
                {loading ? t("auth_sending") : t("auth_send_link")}
              </button>
            </form>
          </div>
        </div>

        <footer className="text-center py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 OneLink. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
