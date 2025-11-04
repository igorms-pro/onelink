import { useLocation } from "react-router-dom";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { LanguageToggleButton } from "./LanguageToggleButton";

export function Header() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  // Hide theme and language toggles on Dashboard (they're in DashboardHeader)
  if (isDashboard) {
    return (
      <header className="w-full flex items-center justify-between p-4 md:p-6">
        <div className="flex-1" /> {/* Spacer */}
      </header>
    );
  }

  return (
    <header className="w-full flex items-center justify-between p-4 md:p-6">
      <div className="flex-1" /> {/* Spacer */}
      <div className="flex items-center gap-2">
        <ThemeToggleButton />
        <LanguageToggleButton />
      </div>
    </header>
  );
}
