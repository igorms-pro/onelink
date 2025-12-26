import { useTranslation } from "react-i18next";
import { FooterSection } from "@/components/footer/FooterSection";
import { FooterLinks } from "@/components/footer/FooterLinks";
import { FooterSocial } from "@/components/footer/FooterSocial";
import { FooterCopyright } from "@/components/footer/FooterCopyright";
import { getFooterSections } from "@/data/footerLinks";

export function Footer() {
  const { t } = useTranslation();
  const sections = getFooterSections(t);

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {sections.map((section, index) => (
            <FooterSection key={index} title={section.title}>
              <FooterLinks links={section.links} />
            </FooterSection>
          ))}
          <FooterSocial />
        </div>
        <FooterCopyright />
      </div>
    </footer>
  );
}
