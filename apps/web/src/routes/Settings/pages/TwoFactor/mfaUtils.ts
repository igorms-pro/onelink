/**
 * Utility functions for MFA operations
 */

import type { MFAEnrollResponse, MFATotpFactor } from "./types";

/**
 * Supabase's MFA enroll endpoint can return:
 * - `uri`: the otpauth:// URI (best for generating QR codes)
 * - `secret`: the raw shared secret
 * - `qr_code`: a data:image/png;base64,... string that already encodes a QR image
 *
 * The `qrcode.react` component expects *text* to encode, not a base64 PNG.
 * Passing the `qr_code` image string directly will cause a "RangeError: Data too long".
 *
 * This helper makes sure we always pass a safe, text-based value to the QR
 * component by preferring `uri` or `secret` and only ever falling back to
 * `qr_code` if it's not an image data URL.
 */
export function getSafeQrCodeValue(params?: {
  uri?: string;
  secret?: string;
  qr_code?: string;
}): string {
  if (!params) return "";

  if (params.uri) return params.uri;
  if (params.secret) return params.secret;

  const code = params.qr_code ?? "";
  if (code && !code.startsWith("data:image/")) {
    return code;
  }

  return "";
}

/**
 * Parse enrollment response from Supabase MFA API
 * Handles different response structures:
 * 1. { totp: { qr_code, uri, secret, ... }, id: "..." } (ID at top level!)
 * 2. { id, qr_code, uri, secret, ... } (direct factor object)
 * 3. { totp: { id, qr_code, uri, secret, ... } } (ID inside totp)
 */
export function parseEnrollmentResponse(
  response: MFAEnrollResponse,
): MFATotpFactor {
  const totpData = response?.totp;
  const directData = response && !totpData ? response : null;

  // Factor ID can be at top level (response.id) OR inside totp (totpData.id)
  // Prefer top-level ID, fallback to totpData.id
  const factorId = response?.id ?? totpData?.id ?? directData?.id;

  if (!factorId) {
    throw new Error("No factor ID in enrollment response");
  }

  const factor: MFATotpFactor = {
    id: factorId,
    friendly_name: response?.friendly_name ?? totpData?.friendly_name ?? null,
    created_at: response?.created_at ?? totpData?.created_at,
    factor_type: response?.factor_type ?? totpData?.factor_type ?? "totp",
    totp: totpData
      ? {
          qr_code: totpData.qr_code,
          uri: totpData.uri,
          secret: totpData.secret,
        }
      : {
          qr_code: directData?.qr_code,
          uri: directData?.uri,
          secret: directData?.secret,
        },
  };

  return factor;
}

/**
 * Check if an error is a 422 (unverified factor exists)
 */
export function is422Error(error: unknown): boolean {
  const errorMsg = error instanceof Error ? error.message : String(error);
  const errorObj = error as { status?: number; message?: string };
  const errorStatus = errorObj?.status;

  return (
    errorStatus === 422 ||
    errorMsg.includes("422") ||
    errorMsg.includes("already exists")
  );
}

/**
 * Check if error indicates factor not found
 */
export function isFactorNotFoundError(error: unknown): boolean {
  const errorMsg = error instanceof Error ? error.message : String(error);
  return (
    errorMsg.includes("not found") ||
    errorMsg.includes("does not exist") ||
    errorMsg.includes("invalid factor")
  );
}
