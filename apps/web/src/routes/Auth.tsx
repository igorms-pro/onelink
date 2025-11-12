import { useForm } from "react-hook-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthProvider";
import { toast } from "sonner";
import { HeaderMobileSignIn } from "../components/HeaderMobileSignIn";
import { setOnboardingIncomplete } from "../lib/onboarding";
import { Footer } from "@/components/Footer";

type FormValues = { email: string };

export default function Auth() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signInWithEmail } = useAuth();
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [loading, setLoading] = useState(false);

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
            <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-white/20 flex items-center justify-center p-4">
              <img
                src="/logo.png"
                alt="OneLink"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold bg-linear-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-4">
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
              className="w-full rounded-xl bg-linear-to-r from-purple-500 to-purple-600 text-white px-8 py-3.5 text-base font-medium hover:from-purple-600 hover:to-purple-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg"
            >
              {loading ? t("auth_sending") : t("auth_send_link")}
            </button>
          </form>

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
