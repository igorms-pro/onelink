import { useTranslation } from "react-i18next";
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
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {t("dashboard_content_drops_title")}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {t("dashboard_content_drops_description")}
      </p>
      <DropForm
        profileId={profileId}
        onDropCreated={handleDropCreated}
        isFree={isFree}
        freeLimit={freeLimit}
        totalItems={links.length + drops.length}
      />
      <DropList profileId={profileId} drops={drops} setDrops={setDrops} />
    </section>
  );
}
