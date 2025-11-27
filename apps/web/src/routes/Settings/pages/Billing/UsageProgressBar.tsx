interface UsageProgressBarProps {
  label: string;
  used: number;
  limit: number;
  unit: string;
  percent: number;
}

export function UsageProgressBar({
  label,
  used,
  limit,
  unit,
  percent,
}: UsageProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-gray-500 dark:text-gray-400">
          {used} / {limit} {unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            percent >= 100
              ? "bg-red-500"
              : percent >= 80
                ? "bg-yellow-500"
                : "bg-green-500"
          }`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
}
