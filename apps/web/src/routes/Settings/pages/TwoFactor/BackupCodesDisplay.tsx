import { useTranslation } from "react-i18next";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface BackupCodesDisplayProps {
  backupCodes: string[];
  showBackupCodes: boolean;
  setShowBackupCodes: (show: boolean) => void;
  onRegenerate?: () => void;
  loading?: boolean;
  variant?: "setup" | "active";
}

export function BackupCodesDisplay({
  backupCodes,
  showBackupCodes,
  setShowBackupCodes,
  onRegenerate,
  loading = false,
  variant = "setup",
}: BackupCodesDisplayProps) {
  const { t } = useTranslation();

  const handleCopyBackupCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(t("settings_2fa_backup_code_copied"));
  };

  const handleCopyAllBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast.success(t("settings_2fa_backup_codes_copied"));
  };

  if (variant === "setup") {
    if (!showBackupCodes || backupCodes.length === 0) return null;

    return (
      <div
        className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
        data-testid="backup-codes-display-setup"
      >
        <div className="flex items-center justify-between mb-3">
          <h3
            className="text-sm font-semibold text-yellow-800 dark:text-yellow-200"
            data-testid="backup-codes-title"
          >
            {t("settings_2fa_backup_codes_title")}
          </h3>
          <button
            onClick={handleCopyAllBackupCodes}
            data-testid="copy-all-backup-codes-button"
            className="text-xs text-yellow-700 dark:text-yellow-300 hover:underline"
          >
            {t("settings_2fa_copy_all")}
          </button>
        </div>
        <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
          {t("settings_2fa_backup_codes_description")}
        </p>
        <BackupCodesList
          codes={backupCodes}
          onCopy={handleCopyBackupCode}
          variant="setup"
        />
      </div>
    );
  }

  // Active variant
  return (
    <div
      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm"
      data-testid="backup-codes-display-active"
    >
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-xl font-semibold text-gray-900 dark:text-white"
          data-testid="backup-codes-title"
        >
          {t("settings_2fa_backup_codes_title")}
        </h2>
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            disabled={loading}
            data-testid="regenerate-backup-codes-button"
            className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {t("settings_2fa_regenerate_backup_codes")}
          </button>
        )}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {t("settings_2fa_backup_codes_description")}
      </p>
      {showBackupCodes && backupCodes.length > 0 ? (
        <BackupCodesList
          codes={backupCodes}
          onCopy={handleCopyBackupCode}
          variant="active"
        />
      ) : (
        <button
          onClick={() => setShowBackupCodes(true)}
          data-testid="show-backup-codes-button"
          className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
        >
          {t("settings_2fa_show_backup_codes")}
        </button>
      )}
    </div>
  );
}

function BackupCodesList({
  codes,
  onCopy,
  variant,
}: {
  codes: string[];
  onCopy: (code: string) => void;
  variant: "setup" | "active";
}) {
  const bgClass =
    variant === "setup"
      ? "bg-white dark:bg-gray-800 border-yellow-200 dark:border-yellow-700"
      : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600";

  return (
    <div className="grid grid-cols-2 gap-2">
      {codes.map((code, index) => (
        <div
          key={index}
          className={`flex items-center justify-between px-3 py-2 rounded border ${bgClass}`}
        >
          <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
            {code}
          </code>
          <button
            onClick={() => onCopy(code)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <Copy className="w-3 h-3 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      ))}
    </div>
  );
}
