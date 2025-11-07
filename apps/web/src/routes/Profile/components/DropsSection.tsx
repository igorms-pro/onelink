import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp } from "lucide-react";
import { DropSubmissionForm } from "./DropSubmissionForm";
import type { PublicDrop } from "../types";

interface DropsSectionProps {
  drops: PublicDrop[];
}

export function DropsSection({ drops }: DropsSectionProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);

  if (drops.length === 0) return null;

  return (
    <section className="mt-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full mb-4 text-left"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {t("profile_section_drops")}
        </h2>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        )}
      </button>
      {isExpanded && (
        <div className="grid gap-4 sm:gap-6">
          {drops.map((d) => (
            <DropSubmissionForm key={d.drop_id} drop={d} />
          ))}
        </div>
      )}
    </section>
  );
}
