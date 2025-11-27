import { useTranslation } from "react-i18next";
import type { DropRow } from "../types";
import { DropCard } from "./DropCard";

interface DropListProps {
  profileId: string | null;
  drops: DropRow[];
  setDrops: React.Dispatch<React.SetStateAction<DropRow[]>>;
}

export function DropList({ profileId, drops, setDrops }: DropListProps) {
  const { t } = useTranslation();

  if (drops.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {t("dashboard_content_drops_empty")}
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-4 grid gap-4 pb-12">
      {drops.map((d) => (
        <DropCard
          key={d.id}
          drop={d}
          profileId={profileId}
          drops={drops}
          setDrops={setDrops}
        />
      ))}
    </ul>
  );
}
