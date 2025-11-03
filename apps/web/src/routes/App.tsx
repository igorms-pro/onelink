import { useTranslation } from "react-i18next";
import { Header } from "../components/Header";

export default function App() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-md w-full p-6 flex flex-col justify-center">
        <h1 className="text-2xl font-semibold">{t("app_title")}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t("app_tagline")}</p>
        <div className="mt-6 flex gap-3">
          <a
            className="rounded bg-black dark:bg-white text-white dark:text-black px-4 py-2 hover:opacity-90 transition-opacity"
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
  );
}
