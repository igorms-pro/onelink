import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { DropRow } from "../types";
import { DropForm } from "./DropForm";
import { DropList } from "./DropList";

interface DropsSectionProps {
  profileId: string | null;
  drops: DropRow[];
  setDrops: React.Dispatch<React.SetStateAction<DropRow[]>>;
  links: Array<{ id: string }>;
  isFree: boolean;
  freeLimit: number;
}

export function DropsSection({
  profileId,
  drops,
  setDrops,
  links,
  isFree,
  freeLimit,
}: DropsSectionProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const handleDropCreated = (newDrop: DropRow) => {
    const nextOrder = drops.length
      ? Math.max(...drops.map((d) => d.order)) + 1
      : 1;
    setDrops(
      [...drops, { ...newDrop, order: nextOrder }].sort(
        (a, b) => a.order - b.order,
      ),
    );
  };

  return (
    <section>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full mb-2 text-left cursor-pointer"
        aria-label={isExpanded ? t("common_collapse") : t("common_expand")}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("dashboard_content_drops_title")}
          </h2>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400 shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400 shrink-0" />
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t("dashboard_content_drops_description")}
        </p>
      </button>
      {isExpanded && (
        <>
          <DropForm
            profileId={profileId}
            onDropCreated={handleDropCreated}
            isFree={isFree}
            freeLimit={freeLimit}
            totalItems={links.length + drops.length}
          />
          <DropList profileId={profileId} drops={drops} setDrops={setDrops} />
        </>
      )}
    </section>
  );
}
