import { useTranslation } from "react-i18next";
import { Github, Linkedin } from "lucide-react";

// X (formerly Twitter) logo component
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function FooterSocial() {
  const { t } = useTranslation();

  const twitterUrl =
    import.meta.env.VITE_SOCIAL_TWITTER_URL || "https://x.com/GetOneLink";
  const githubUrl =
    import.meta.env.VITE_SOCIAL_GITHUB_URL ||
    "https://github.com/igorms-pro/onelink";
  const linkedinUrl =
    import.meta.env.VITE_SOCIAL_LINKEDIN_URL ||
    "https://www.linkedin.com/company/getonelink/";

  return (
    <div>
      <h3 className="text-white font-semibold mb-4">
        {t("landing.footer.social")}
      </h3>
      <ul className="flex gap-4">
        <li>
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors cursor-pointer"
            aria-label="X (formerly Twitter)"
          >
            <XIcon className="size-5" />
          </a>
        </li>
        <li>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors cursor-pointer"
            aria-label="GitHub"
          >
            <Github className="size-5" />
          </a>
        </li>
        <li>
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors cursor-pointer"
            aria-label="LinkedIn"
          >
            <Linkedin className="size-5" />
          </a>
        </li>
      </ul>
    </div>
  );
}
