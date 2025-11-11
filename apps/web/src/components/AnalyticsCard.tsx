import { LinksAnalyticsCard } from "./LinksAnalyticsCard";
import { DropsAnalyticsCard } from "@/routes/Dashboard/components/DropsAnalyticsCard";

export function AnalyticsCard({ profileId }: { profileId: string | null }) {
  return (
    <>
      <LinksAnalyticsCard profileId={profileId} />
      <DropsAnalyticsCard profileId={profileId} />
    </>
  );
}
