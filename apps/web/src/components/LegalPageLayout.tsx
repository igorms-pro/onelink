import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { LanguageToggleButton } from "./LanguageToggleButton";

export interface LegalSectionContent {
  id: string;
  title: string;
  paragraphs?: string[];
  items?: string[];
}

interface LegalPageLayoutProps {
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSectionContent[];
  className?: string;
}

export function LegalPageLayout({
  title,
  description,
  lastUpdated,
  sections,
  className,
}: LegalPageLayoutProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const appTitle =
    i18n?.exists && i18n.exists("app_title") ? t("app_title") : "OneLink";

  // Scroll to top when navigating to privacy/terms pages
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleBack = () => {
    // Try to go back, but if no history, go to home
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div
      className={clsx(
        "min-h-screen bg-white dark:bg-gray-950 transition-colors flex flex-col",
        className,
      )}
    >
      {/* Sticky Header with Logo */}
      <header
        data-testid="legal-header"
        className="sticky top-0 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-50 shadow-sm shrink-0"
      >
        <div className="mx-auto max-w-4xl w-full flex items-center justify-between px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-3">
          <Link
            to="/"
            data-testid="legal-header-logo-link"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 dark:bg-white/20 flex items-center justify-center p-1.5 sm:p-2">
              <img
                src="/onelink-logo-64.png"
                alt="OneLink"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-linear-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
              {appTitle}
            </span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="scale-100 sm:scale-110">
              <ThemeToggleButton />
            </div>
            <div className="scale-100 sm:scale-110">
              <LanguageToggleButton />
            </div>
          </div>
        </div>
      </header>
      <div className="relative isolate overflow-hidden bg-linear-to-r from-purple-500/10 via-purple-500/5 to-blue-500/10 dark:from-purple-500/20 dark:via-purple-500/10 dark:to-blue-500/20">
        <div className="absolute inset-y-0 right-0 -z-10 w-1/2 bg-linear-to-l from-purple-500/10 to-transparent blur-3xl"></div>
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 pb-8 pt-6 sm:px-6 sm:pt-8 lg:px-8">
          <button
            onClick={handleBack}
            data-testid="legal-back-button"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-purple-700 shadow-sm transition hover:bg-white dark:bg-white/10 dark:text-purple-200 dark:hover:bg-white/20 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("back", { defaultValue: "Back" })}
          </button>
          <div className="space-y-4">
            <h1
              data-testid="legal-page-title"
              className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl"
            >
              {title}
            </h1>
            <p
              data-testid="legal-page-description"
              className="max-w-2xl text-base text-gray-600 dark:text-gray-300"
            >
              {description}
            </p>
            <p
              data-testid="legal-page-last-updated"
              className="text-sm text-gray-500 dark:text-gray-400"
            >
              {lastUpdated}
            </p>
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="space-y-12">
            {sections.map((section) => (
              <section
                key={section.id}
                data-testid={`legal-section-${section.id}`}
                className="scroll-mt-24"
              >
                <h2
                  data-testid={`legal-section-title-${section.id}`}
                  className="text-2xl font-semibold text-gray-900 dark:text-white"
                >
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-base leading-relaxed text-gray-600 dark:text-gray-300">
                  {section.paragraphs?.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                  {section.items && section.items.length > 0 && (
                    <ul className="list-disc space-y-2 pl-5">
                      {section.items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
