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
    <section className="rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-lg shadow-gray-200/50 dark:shadow-black/20 hover:shadow-xl transition-shadow">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Drops
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Create file inboxes for people to submit files
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
