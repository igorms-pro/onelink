import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { PublicLink } from "../types";
import { LinkCard } from "./LinkCard";
import { isSocialLink } from "../utils/socialDetection.tsx";

interface LinksSectionProps {
  links: PublicLink[];
}

export function LinksSection({ links }: LinksSectionProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter out social links (they're shown in ProfileHeader)
  const nonSocialLinks = links.filter((link) => !isSocialLink(link.url));

  if (nonSocialLinks.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 sm:mt-10">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full mb-4 text-left"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {t("profile_section_routes")}
        </h2>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        )}
      </button>
      {isExpanded && (
        <div className="grid gap-3 sm:gap-4">
          {nonSocialLinks.map((link) => (
            <LinkCard key={link.link_id} link={link} />
          ))}
        </div>
      )}
    </section>
  );
}
