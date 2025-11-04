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
  freeLimit: number;
}

export function ContentTab({
  profileId,
  links,
  setLinks,
  drops,
  setDrops,
  isFree,
  freeLimit,
}: ContentTabProps) {
  return (
    <div className="space-y-8">
      <LinksSection
        profileId={profileId}
        links={links}
        setLinks={setLinks}
        drops={drops}
        isFree={isFree}
        freeLimit={freeLimit}
      />
      <DropsSection
        profileId={profileId}
        drops={drops}
        setDrops={setDrops}
        links={links}
        isFree={isFree}
        freeLimit={freeLimit}
      />
    </div>
  );
}
