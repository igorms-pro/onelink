import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { HeaderMobileSignIn } from "./HeaderMobileSignIn";
import { Footer } from "./Footer";

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
  const { t } = useTranslation();

  return (
    <div
      className={clsx(
        "min-h-screen bg-white dark:bg-gray-950 transition-colors flex flex-col",
        className,
      )}
    >
      <HeaderMobileSignIn />
      <div className="relative isolate overflow-hidden bg-linear-to-r from-purple-500/10 via-purple-500/5 to-blue-500/10 dark:from-purple-500/20 dark:via-purple-500/10 dark:to-blue-500/20">
        <div className="absolute inset-y-0 right-0 -z-10 w-1/2 bg-gradient-to-l from-purple-500/10 to-transparent blur-3xl"></div>
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pt-16">
          <Link
            to="/auth"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-purple-700 shadow-sm transition hover:bg-white dark:bg-white/10 dark:text-purple-200 dark:hover:bg-white/20 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("legal_back_to_auth")}
          </Link>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              {title}
            </h1>
            <p className="max-w-2xl text-base text-gray-600 dark:text-gray-300">
              {description}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {lastUpdated}
            </p>
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="space-y-12">
            {sections.map((section) => (
              <section key={section.id} className="scroll-mt-24">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
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
      <Footer />
    </div>
  );
}
