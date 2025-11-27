import { useTranslation } from "react-i18next";

interface DomainFormProps {
  domainInput: string;
  setDomainInput: (value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  error?: string;
  onClearError: () => void;
}

export function DomainForm({
  domainInput,
  setDomainInput,
  onSubmit,
  submitting,
  error,
  onClearError,
}: DomainFormProps) {
  const { t } = useTranslation();

  return (
    <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {t("settings_domain_add_title")}
      </h2>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="domain-input"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {t("settings_domain_label")}
          </label>
          <div className="flex gap-2">
            <input
              id="domain-input"
              type="text"
              value={domainInput}
              onChange={(e) => {
                setDomainInput(e.target.value);
                if (error) onClearError();
              }}
              placeholder={t("settings_domain_placeholder")}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={submitting}
            />
            <button
              onClick={onSubmit}
              disabled={submitting || !domainInput.trim()}
              className="px-6 py-2 rounded-lg bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {submitting ? t("common_loading") : t("common_add")}
            </button>
          </div>
          {error && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {t("settings_domain_hint")}
          </p>
        </div>
      </div>
    </section>
  );
}
