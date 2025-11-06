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
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none"
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
      <main className="flex-1 mx-auto max-w-md w-full p-6 flex flex-col justify-center relative z-10">
        <div className="flex flex-col justify-center text-center">
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-4">
            {t("app_title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-8">
            {t("app_tagline")}
          </p>

          {/* Sign-in form */}
          <form
            className="grid gap-3 max-w-sm mx-auto w-full"
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
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-8 py-3.5 text-base placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all"
              disabled={loading}
              {...register("email")}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-3.5 text-base font-medium hover:from-purple-600 hover:to-purple-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg"
            >
              {loading ? t("auth_sending") : t("auth_send_link")}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
