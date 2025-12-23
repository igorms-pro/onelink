import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  const { t } = useTranslation();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Product Section */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              {t("landing.footer.product")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/features"
                  className="hover:text-white transition-colors text-sm"
                >
                  {t("landing.footer.features")}
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="hover:text-white transition-colors text-sm"
                >
                  {t("landing.footer.pricing")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              {t("landing.footer.company")}
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:support@getonelink.app"
                  className="hover:text-white transition-colors text-sm"
                >
                  {t("landing.footer.contact")}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              {t("landing.footer.legal")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-white transition-colors text-sm"
                >
                  {t("landing.footer.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-white transition-colors text-sm"
                >
                  {t("landing.footer.terms")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Section */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              {t("landing.footer.social")}
            </h3>
            <ul className="flex gap-4">
              <li>
                <a
                  href="https://twitter.com/getonelink"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="size-5" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/getonelink"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="size-5" />
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com/company/getonelink"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="size-5" />
                </a>
              </li>
            </ul>
          </div>

          {/* App Section */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              {t("landing.footer.app")}
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://app.getonelink.io/auth"
                  className="hover:text-white transition-colors text-sm"
                >
                  {t("landing.footer.signIn")}
                </a>
              </li>
              <li>
                <a
                  href="https://app.getonelink.io/auth"
                  className="hover:text-white transition-colors text-sm"
                >
                  {t("landing.footer.signUp")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-center text-sm text-gray-400">
            {t("footer_all_rights", { year: currentYear })}
          </p>
        </div>
      </div>
    </footer>
  );
}
