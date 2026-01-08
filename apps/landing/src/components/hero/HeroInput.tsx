import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { trackUsernameEntered } from "@/lib/analytics";

interface HeroInputProps {
  username: string;
  onUsernameChange: (value: string) => void;
  onSubmit: () => void;
}

export function HeroInput({
  username,
  onUsernameChange,
  onSubmit,
}: HeroInputProps) {
  const { t } = useTranslation();
  const hasTrackedUsername = useRef(false);

  const handleChange = (value: string) => {
    onUsernameChange(value);

    // Track only once when user starts typing (transitions from empty to non-empty)
    if (!hasTrackedUsername.current && value.trim().length > 0) {
      hasTrackedUsername.current = true;
      trackUsernameEntered("hero", value.trim().length);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 order-2 lg:col-span-1">
      <div className="flex-[0.65] relative">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <span className="text-base md:text-lg text-gray-500 dark:text-gray-400 font-medium">
            app.getonelink.io/
          </span>
        </div>
        <input
          type="text"
          value={username}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSubmit();
            }
          }}
          placeholder={t("landing.hero.usernamePlaceholder")}
          className="w-full pl-[160px] md:pl-[180px] pr-5 py-4 md:py-5 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg md:text-xl placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all"
        />
      </div>
      <Button
        data-testid="hero-cta-get-started"
        className="flex-1 sm:flex-initial sm:min-w-[200px] md:min-w-[220px] px-6 md:px-8 py-4 md:py-5 h-auto text-lg md:text-xl bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/50 whitespace-nowrap font-semibold rounded-xl"
        onClick={onSubmit}
      >
        {t("landing.hero.ctaPrimary")}
        <ArrowRight className="size-5 ml-2" />
      </Button>
    </div>
  );
}
