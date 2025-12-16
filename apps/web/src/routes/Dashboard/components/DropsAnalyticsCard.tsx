import { useState } from "react";
import {
  useDropsAnalytics,
  DropsAnalyticsHeader,
  DropsAnalyticsEmpty,
  DropsAnalyticsSkeleton,
  DropsAnalyticsTable,
} from "./analytics";

export function DropsAnalyticsCard({
  profileId,
  days,
}: {
  profileId: string | null;
  days: 7 | 30 | 90;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { rows, loading } = useDropsAnalytics(profileId, days);

  if (!profileId) return null;

  return (
    <div className="mt-3" data-testid="drops-analytics-card">
      <DropsAnalyticsHeader
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
      />
      {isExpanded && (
        <>
          {rows.length === 0 && !loading ? (
            <DropsAnalyticsEmpty />
          ) : rows.length === 0 && loading ? (
            <DropsAnalyticsSkeleton />
          ) : (
            <DropsAnalyticsTable rows={rows} loading={loading} />
          )}
        </>
      )}
    </div>
  );
}
