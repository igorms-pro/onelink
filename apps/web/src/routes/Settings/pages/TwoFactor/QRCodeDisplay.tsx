import { useTranslation } from "react-i18next";
import { Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

interface QRCodeDisplayProps {
  qrCodeData: string;
  secret: string;
}

export function QRCodeDisplay({ qrCodeData, secret }: QRCodeDisplayProps) {
  const { t } = useTranslation();

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    toast.success(t("settings_2fa_secret_copied"));
  };

  return (
    <>
      {/* QR Code */}
      <div
        className="flex flex-col items-center mb-6"
        data-testid="qr-code-container"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
          {qrCodeData && (
            <QRCodeSVG
              value={qrCodeData}
              size={200}
              level="M"
              data-testid="qr-code"
            />
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
          {t("settings_2fa_scan_qr_code")}
        </p>
      </div>

      {/* Secret Key */}
      <div className="mb-6" data-testid="secret-key-container">
        <label
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          data-testid="secret-key-label"
        >
          {t("settings_2fa_secret_key")}
        </label>
        <div className="flex items-center gap-2">
          <code
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-mono text-gray-900 dark:text-gray-100"
            data-testid="secret-key-value"
          >
            {secret}
          </code>
          <button
            onClick={handleCopySecret}
            data-testid="copy-secret-button"
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Copy className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {t("settings_2fa_secret_key_description")}
        </p>
      </div>
    </>
  );
}
