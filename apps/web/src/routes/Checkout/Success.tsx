import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { HeaderMobileSignIn } from "@/components/HeaderMobileSignIn";
import { Footer } from "@/components/Footer";

export default function CheckoutSuccess() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors flex flex-col">
      <HeaderMobileSignIn />
      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl rounded-3xl border border-green-200 bg-green-50/70 p-10 text-center shadow-sm dark:border-green-900/40 dark:bg-green-900/20">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-300">
            <Sparkles className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            {t("checkout_success.title")}
          </h1>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            {t("checkout_success.subtitle")}
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t("checkout_success.message")}
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-purple-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:from-purple-600 hover:to-purple-700 cursor-pointer"
          >
            {t("checkout_success.button")}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
