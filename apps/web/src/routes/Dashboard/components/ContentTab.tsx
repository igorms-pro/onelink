import type { LinkRow } from "@/components/LinksList";
import type { DropRow } from "../types";
import { LinksSection } from "./LinksSection";
import { DropsSection } from "./DropsSection";

interface ContentTabProps {
  profileId: string | null;
  links: LinkRow[];
  setLinks: React.Dispatch<React.SetStateAction<LinkRow[]>>;
  drops: DropRow[];
  setDrops: React.Dispatch<React.SetStateAction<DropRow[]>>;
  isFree: boolean;
  freeLinksLimit: number;
  freeDropsLimit: number;
}

export function ContentTab({
  profileId,
  links,
  setLinks,
  drops,
  setDrops,
  isFree,
  freeLinksLimit,
  freeDropsLimit,
}: ContentTabProps) {
  return (
    <div className="space-y-6 mt-2 sm:mt-0">
      <LinksSection
        profileId={profileId}
        links={links}
        setLinks={setLinks}
        isFree={isFree}
        freeLinksLimit={freeLinksLimit}
      />
      <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>
      <DropsSection
        profileId={profileId}
        drops={drops}
        setDrops={setDrops}
        isFree={isFree}
        freeDropsLimit={freeDropsLimit}
      />
    </div>
  );
}
