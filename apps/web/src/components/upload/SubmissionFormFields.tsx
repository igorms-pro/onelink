import { useTranslation } from "react-i18next";

export function SubmissionFormFields() {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 mb-6">
      <input
        name="name"
        placeholder={t("profile_drop_submission_name_placeholder")}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all"
      />
      <input
        name="email"
        type="email"
        placeholder={t("profile_drop_submission_email_placeholder")}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all"
      />
      <textarea
        name="note"
        placeholder={t("profile_drop_submission_note_placeholder")}
        rows={4}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all resize-none"
      />
    </div>
  );
}
