export function InboxSkeleton() {
  return (
    <section data-testid="inbox-skeleton" className="mt-2 sm:mt-0">
      {/* Action buttons skeleton */}
      <div className="mb-4 flex justify-between items-center gap-2">
        <div className="hidden sm:block h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>

      {/* Inbox items skeleton */}
      <ul className="grid gap-3">
        {[1, 2, 3].map((i) => (
          <li
            key={i}
            className="rounded-xl p-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 animate-pulse"
          >
            <div className="flex items-start gap-3">
              {/* Icon skeleton */}
              <div className="shrink-0 flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-300 dark:bg-gray-700" />
                <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700" />
              </div>
              {/* Content skeleton */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                    <div className="h-3 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
                  </div>
                  <div className="h-6 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
                </div>
                <div className="space-y-2 mt-2">
                  <div className="h-3 w-full bg-gray-300 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-3/4 bg-gray-300 dark:bg-gray-700 rounded" />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
