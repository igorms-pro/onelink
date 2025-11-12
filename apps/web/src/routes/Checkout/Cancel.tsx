import { ArrowLeft, Repeat2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { HeaderMobileSignIn } from "@/components/HeaderMobileSignIn";
import { Footer } from "@/components/Footer";

export default function CheckoutCancel() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors flex flex-col">
      <HeaderMobileSignIn />
      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl rounded-3xl border border-orange-200 bg-orange-50/70 p-10 text-center shadow-sm dark:border-orange-900/40 dark:bg-orange-900/20">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300">
            <Repeat2 className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            {t("checkout_cancel.title")}
          </h1>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            {t("checkout_cancel.subtitle")}
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t("checkout_cancel.message")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => navigate("/pricing")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-purple-200 hover:bg-purple-50 dark:border-gray-700 dark:text-gray-200 dark:hover:border-purple-400/60 dark:hover:bg-purple-500/10 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("checkout_cancel.back_to_pricing")}
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-purple-500 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:from-purple-600 hover:to-purple-700 cursor-pointer"
            >
              {t("checkout_cancel.contact_support")}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
