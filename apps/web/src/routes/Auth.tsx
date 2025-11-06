import { useForm } from "react-hook-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../lib/AuthProvider";
import { toast } from "sonner";
import { Header } from "../components/Header";

type FormValues = { email: string };

export default function Auth() {
  const { t } = useTranslation();
  const { signInWithEmail } = useAuth();
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        ></div>
      </div>

      <div className="relative z-10">
        <Header />
        <main className="flex-1 mx-auto max-w-md w-full p-6 flex flex-col justify-center">
          <div className="rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 shadow-lg shadow-gray-200/50 dark:shadow-black/20">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t("auth_sign_in_title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 mb-6">
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
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                disabled={loading}
                {...register("email")}
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2.5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm opacity-100"
              >
                {loading ? t("auth_sending") : t("auth_send_link")}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
