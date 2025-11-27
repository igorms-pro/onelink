import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Check, X } from "lucide-react";
import clsx from "clsx";

export interface PasswordValidationRulesProps {
  password: string;
  showAll?: boolean;
}

interface Rule {
  key: string;
  test: (password: string) => boolean;
}

const rules: Rule[] = [
  { key: "min_length", test: (p) => p.length >= 8 },
  { key: "lowercase", test: (p) => /[a-z]/.test(p) },
  { key: "uppercase", test: (p) => /[A-Z]/.test(p) },
  { key: "number", test: (p) => /[0-9]/.test(p) },
  { key: "special", test: (p) => /[^a-zA-Z0-9]/.test(p) },
];

export function PasswordValidationRules({
  password,
  showAll = false,
}: PasswordValidationRulesProps) {
  const { t } = useTranslation();

  const results = useMemo(
    () =>
      rules.map((rule) => ({
        ...rule,
        passed: rule.test(password),
      })),
    [password],
  );

  if (!password && !showAll) return null;

  const visibleRules = showAll ? results : results.filter((r) => !r.passed);

  if (visibleRules.length === 0) return null;

  return (
    <ul className="space-y-1 text-xs" data-testid="password-validation-rules">
      {visibleRules.map((rule) => (
        <li
          key={rule.key}
          data-testid={`password-rule-${rule.key}`}
          className={clsx(
            "flex items-center gap-1.5",
            rule.passed
              ? "text-green-600 dark:text-green-400"
              : "text-gray-500 dark:text-gray-400",
          )}
        >
          {rule.passed ? (
            <Check className="h-3 w-3" />
          ) : (
            <X className="h-3 w-3" />
          )}
          {t(`password_rule_${rule.key}`)}
        </li>
      ))}
    </ul>
  );
}
