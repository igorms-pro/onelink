import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";

export interface PasswordStrengthIndicatorProps {
  password: string;
}

type StrengthLevel = "weak" | "fair" | "good" | "strong";

interface StrengthResult {
  level: StrengthLevel;
  score: number;
}

function calculateStrength(password: string): StrengthResult {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  let level: StrengthLevel;
  if (score <= 2) level = "weak";
  else if (score <= 3) level = "fair";
  else if (score <= 4) level = "good";
  else level = "strong";

  return { level, score };
}

const strengthColors: Record<StrengthLevel, string> = {
  weak: "bg-red-500",
  fair: "bg-yellow-500",
  good: "bg-blue-500",
  strong: "bg-green-500",
};

const strengthTextColors: Record<StrengthLevel, string> = {
  weak: "text-red-600 dark:text-red-400",
  fair: "text-yellow-600 dark:text-yellow-400",
  good: "text-blue-600 dark:text-blue-400",
  strong: "text-green-600 dark:text-green-400",
};

export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const { t } = useTranslation();

  const { level, score } = useMemo(
    () => calculateStrength(password),
    [password],
  );

  if (!password) return null;

  const barCount = 4;
  const filledBars = Math.ceil((score / 6) * barCount);

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {Array.from({ length: barCount }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              "h-1 flex-1 rounded-full transition-colors",
              i < filledBars
                ? strengthColors[level]
                : "bg-gray-200 dark:bg-gray-700",
            )}
          />
        ))}
      </div>
      <p className={clsx("text-xs", strengthTextColors[level])}>
        {t(`password_strength_${level}`)}
      </p>
    </div>
  );
}
