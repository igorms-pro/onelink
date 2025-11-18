import type { DropWithVisibility } from "@/lib/drops";

interface DropHeaderProps {
  drop: DropWithVisibility;
}

export function DropHeader({ drop }: DropHeaderProps) {
  return (
    <div className="mb-8 text-center">
      {drop.emoji && (
        <span className="text-5xl mb-4 block" aria-hidden="true">
          {drop.emoji}
        </span>
      )}
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        {drop.label}
      </h1>
      <div className="flex items-center justify-center gap-2 mt-4">
        {drop.is_public ? (
          <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
            🌐 Public
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 text-sm font-medium">
            🔒 Private
          </span>
        )}
      </div>
    </div>
  );
}
