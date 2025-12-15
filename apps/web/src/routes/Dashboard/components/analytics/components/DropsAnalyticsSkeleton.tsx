export function DropsAnalyticsSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex justify-between items-center rounded-lg bg-teal-50 dark:bg-teal-900/20 p-3"
        >
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-8"></div>
        </div>
      ))}
    </div>
  );
}
