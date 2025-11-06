import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../lib/AuthProvider";
import { Header } from "../components/Header";

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
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 relative overflow-hidden">
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
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
            {t("app_title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t("app_tagline")}
          </p>
          <div className="mt-6 flex gap-3">
            <a
              className="rounded bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 hover:opacity-90 transition-opacity opacity-100 shadow-sm"
              href="/auth"
            >
              {t("sign_in")}
            </a>
            <a
              className="rounded border border-gray-300 dark:border-gray-600 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              href="/igor"
            >
              {t("view_sample")}
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}
