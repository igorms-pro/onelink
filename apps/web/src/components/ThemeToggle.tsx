import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export function ThemeToggle() {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<string>(() => localStorage.getItem("theme") || "system");

  useEffect(() => {
    const root = document.documentElement;
    const apply = (t: string) => {
      if (t === "dark") {
        root.setAttribute("data-theme", "dark");
        root.style.colorScheme = "dark";
      } else if (t === "light") {
        root.setAttribute("data-theme", "light");
        root.style.colorScheme = "light";
      } else {
        root.removeAttribute("data-theme");
        root.style.colorScheme = "light dark";
      }
    };
    apply(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="flex items-center justify-between py-2">
      <label className="text-sm text-gray-900 dark:text-gray-100">{t("theme")}</label>
      <select
        className="rounded border border-gray-300 dark:border-gray-600 px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      >
        <option value="system">{t("system")}</option>
        <option value="light">{t("light")}</option>
        <option value="dark">{t("dark")}</option>
      </select>
    </div>
  );
}


