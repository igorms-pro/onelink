import { authenticator } from "otplib";

/**
 * Generate a new TOTP secret
 */
export function generateTOTPSecret(): string {
  return authenticator.generateSecret();
}

/**
 * Generate backup codes (10 codes of 8 characters each)
 */
export function generateBackupCodes(): string[] {
  return Array.from({ length: 10 }, () => {
    // Generate 8-character alphanumeric code
    return Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()
      .padEnd(8, "0");
  });
}

/**
 * Generate QR code data URL for TOTP setup
 */
export function generateQRCodeData(
  accountName: string,
  secret: string,
  issuer: string = "OneLink",
): string {
  return authenticator.keyuri(accountName, issuer, secret);
}

/**
 * Verify a TOTP code against a secret
 */
export function verifyTOTPCode(code: string, secret: string): boolean {
  return authenticator.verify({
    token: code,
    secret: secret,
  });
}
