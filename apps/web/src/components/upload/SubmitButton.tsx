import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  isLoading?: boolean;
  disabled?: boolean;
  loadingText?: string;
}

export function SubmitButton({
  isLoading = false,
  disabled = false,
  loadingText,
}: SubmitButtonProps) {
  const { t } = useTranslation();

  return (
    <button
      type="submit"
      disabled={isLoading || disabled}
      className="w-full rounded-lg bg-linear-to-r from-purple-600 to-purple-700 text-white px-6 py-3.5 text-base font-semibold hover:from-purple-700 hover:to-purple-800 active:scale-[0.98] transition-all shadow-lg shadow-purple-500/20 dark:shadow-purple-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          {loadingText || t("common_uploading")}
        </>
      ) : (
        t("profile_drop_submission_send")
      )}
    </button>
  );
}
