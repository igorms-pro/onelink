import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Plus, Link2, FileText } from "lucide-react";

interface EmptyStateProps {
  isOwner: boolean;
}

export function EmptyState({ isOwner }: EmptyStateProps) {
  const { t } = useTranslation();

  if (isOwner) {
    return (
      <div className="mt-12 sm:mt-16 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-6">
          <Plus className="w-10 h-10 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {t("profile_empty_title_owner")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          {t("profile_empty_description_owner")}
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
        >
          <Link2 className="w-5 h-5" />
          {t("profile_empty_cta_owner")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-12 sm:mt-16 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
        <FileText className="w-10 h-10 text-gray-400 dark:text-gray-500" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
        {t("profile_empty_title_visitor")}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
        {t("profile_empty_description_visitor")}
      </p>
    </div>
  );
}
