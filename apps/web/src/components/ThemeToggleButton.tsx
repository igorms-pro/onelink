import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

export function ThemeToggleButton() {
  const [theme, setTheme] = useState<string>(
    () => localStorage.getItem("theme") || "system",
  );
  const [isDark, setIsDark] = useState(false);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    const apply = (t: string) => {
      let actualTheme = t;
      if (t === "system") {
        actualTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
      setIsDark(actualTheme === "dark");
      if (actualTheme === "dark") {
        root.classList.add("dark");
        root.setAttribute("data-theme", "dark");
        root.style.colorScheme = "dark";
      } else {
        root.classList.remove("dark");
        root.setAttribute("data-theme", "light");
        root.style.colorScheme = "light";
      }
    };
    apply(theme);
    localStorage.setItem("theme", theme);
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => apply("system");
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme]);

  // Toggle theme
  const toggleTheme = () => {
    const current = localStorage.getItem("theme") || "system";
    if (current === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setTheme(prefersDark ? "light" : "dark");
    } else if (current === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
