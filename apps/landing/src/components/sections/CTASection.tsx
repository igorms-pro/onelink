import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { trackSignUpClick } from "@/lib/analytics";
import { Layout } from "@/components/Layout";

export function CTASection() {
  const { t } = useTranslation();

  return (
    <section
      className="py-16 sm:py-20 lg:py-24 bg-linear-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 opacity-0"
      data-scroll-animate
    >
      <Layout className="max-w-4xl mx-auto">
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
            <a
              data-testid="cta-section-secondary"
              href="#pricing"
              className="text-white/90 hover:text-white underline underline-offset-4 transition-colors text-lg font-medium"
            >
              {t("landing.cta.ctaSecondary")}
            </a>
          </div>
        </div>
      </Layout>
    </section>
  );
}
