import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { trackSignUpClick, trackUsernameEntered } from "@/lib/analytics";
import { Layout } from "@/components/Layout";

export function CTASection() {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const hasTrackedUsername = useRef(false);

  const handleUsernameChange = (value: string) => {
    setUsername(value);

    // Track only once when user starts typing (transitions from empty to non-empty)
    if (!hasTrackedUsername.current && value.trim().length > 0) {
      hasTrackedUsername.current = true;
      trackUsernameEntered("cta_section", value.trim().length);
    }
  };

  const handleGetStarted = () => {
    trackSignUpClick("cta_section");
    const authUrl = username.trim()
      ? `https://app.onlnk.io/auth?username=${encodeURIComponent(username.trim())}`
      : "https://app.onlnk.io/auth";
    window.location.href = authUrl;
  };

  return (
    <section
      className="py-16 md:py-24 bg-linear-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 opacity-0"
      data-scroll-animate
    >
      <Layout>
        <div className="w-full">
          <div className="text-center space-y-8 md:space-y-10">
            {/* Headline */}
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
              {t("landing.cta.title")}
            </h2>

            {/* Input and Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-4xl mx-auto">
              <div className="relative w-full sm:flex-[0.8] sm:w-auto sm:min-w-[400px]">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <span className="text-base md:text-lg text-gray-500 dark:text-gray-400 font-medium">
                    app.onlnk.io/
                  </span>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleGetStarted();
                    }
                  }}
                  placeholder="username"
                  className="w-full pl-[160px] md:pl-[180px] pr-5 py-4 md:py-5 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg md:text-xl placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all"
                />
              </div>
              <Button
                data-testid="cta-section-primary"
                className="w-full sm:flex-initial sm:min-w-[200px] md:min-w-[220px] px-6 md:px-8 py-4 md:py-5 h-auto text-lg md:text-xl bg-white text-purple-600 hover:bg-gray-100 shadow-lg shadow-purple-500/50 whitespace-nowrap font-semibold rounded-xl"
                onClick={handleGetStarted}
              >
                {t("landing.cta.ctaPrimary")}
                <ArrowRight className="size-5 ml-2" />
              </Button>
            </div>

            {/* Secondary CTA */}
            <div className="pt-2">
              <a
                data-testid="cta-section-secondary"
                href="#pricing"
                className="text-white/90 hover:text-white underline underline-offset-4 transition-colors text-base md:text-lg font-medium cursor-pointer"
              >
                {t("landing.cta.ctaSecondary")}
              </a>
            </div>
          </div>
        </div>
      </Layout>
    </section>
  );
}
