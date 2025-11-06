import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../lib/AuthProvider";
import { HeaderMobileSignIn } from "../components/HeaderMobileSignIn";

export default function App() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect logged-in users to dashboard (like Linktree)
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  // Don't show landing page if redirecting
  if (loading || user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors relative">
      {/* Gradient blobs background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-pink-400/15 dark:bg-pink-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-300/15 dark:bg-purple-500/10 rounded-full blur-3xl"></div>
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
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-center">
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
