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
    <div
      className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors relative"
      style={{
        backgroundImage: "url(/screen.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <HeaderMobileSignIn />
      <main className="flex-1 mx-auto max-w-md w-full p-6 flex flex-col justify-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <div className="rounded-xl border border-gray-200/50 dark:border-gray-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 shadow-lg">
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
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all"
              disabled={loading}
              {...register("email")}
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2.5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
            >
              {loading ? t("auth_sending") : t("auth_send_link")}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
