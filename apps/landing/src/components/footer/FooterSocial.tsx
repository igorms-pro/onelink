import { useTranslation } from "react-i18next";
import { Github, Twitter, Linkedin } from "lucide-react";

export function FooterSocial() {
  const { t } = useTranslation();

  return (
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
  );
}
