import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { trackSignUpClick } from "@/lib/analytics";

export function CTASection() {
  const { t } = useTranslation();

  return (
    <section
      className="py-16 sm:py-20 lg:py-24 bg-linear-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 opacity-0"
      data-scroll-animate
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6">
          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            {t("landing.cta.title")}
          </h2>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              data-testid="cta-section-primary"
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg shadow-purple-500/50 dark:bg-gray-900 dark:text-purple-300 dark:hover:bg-gray-800"
              onClick={() => {
                trackSignUpClick("cta_section");
                window.location.href = "https://app.getonelink.io/auth";
              }}
            >
              {t("landing.cta.ctaPrimary")}
              <ArrowRight className="size-4" />
            </Button>
            <Link
              data-testid="cta-section-secondary"
              to="/pricing"
              className="text-white/90 hover:text-white underline underline-offset-4 transition-colors text-lg font-medium"
            >
              {t("landing.cta.ctaSecondary")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
