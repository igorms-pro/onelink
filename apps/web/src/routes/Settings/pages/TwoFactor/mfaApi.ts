/**
 * Supabase MFA API wrapper functions
 * Provides clean, typed API calls for MFA operations
 */

import { supabase } from "@/lib/supabase";
import type {
  SupabaseMFAClient,
  MFAFactors,
  MFAEnrollResponse,
  MFAChallengeResponse,
} from "./types";

/**
 * Get the typed MFA client from Supabase
 */
function getMFAClient(): SupabaseMFAClient {
  return supabase.auth.mfa as unknown as SupabaseMFAClient;
}

/**
 * List all MFA factors for the current user
 */
export async function listFactors(): Promise<MFAFactors> {
  const mfaClient = getMFAClient();
  const { data, error } = await mfaClient.listFactors();

  if (error) {
    throw error;
  }

  return (data as MFAFactors) ?? { totp: [] };
}

/**
 * Enroll a new TOTP factor
 */
export async function enrollFactor(): Promise<MFAEnrollResponse> {
  const mfaClient = getMFAClient();
  const { data, error } = await mfaClient.enroll({
    factorType: "totp",
  });

  if (error) {
    throw { error, data };
  }

  return data as MFAEnrollResponse;
}

/**
 * Challenge a factor (request verification code)
 */
export async function challengeFactor(
  factorId: string,
): Promise<MFAChallengeResponse> {
  const mfaClient = getMFAClient();
  const { data, error } = await mfaClient.challenge({
    factorId,
  });

  if (error) {
    throw error;
  }

  return (data as MFAChallengeResponse) ?? { id: undefined };
}

/**
 * Verify a TOTP code for enrollment or challenge
 */
export async function verifyCode(
  factorId: string,
  code: string,
  challengeId?: string,
): Promise<void> {
  const mfaClient = getMFAClient();
  const { error } = await mfaClient.verify({
    factorId,
    code,
    challengeId,
  });

  if (error) {
    throw error;
  }
}

/**
 * Unenroll (disable) an MFA factor
 */
export async function unenrollFactor(factorId: string): Promise<void> {
  const mfaClient = getMFAClient();
  const { error } = await mfaClient.unenroll({
    factorId,
  });

  if (error) {
    throw error;
  }
}

/**
 * Clean up unverified factors by unenrolling all verified factors
 * This is used when enrollment fails with 422 (unverified factor exists)
 */
export async function cleanupVerifiedFactors(): Promise<void> {
  const mfaClient = getMFAClient();
  const { data: existingFactors } = await mfaClient.listFactors();

  if (existingFactors?.totp && existingFactors.totp.length > 0) {
    await Promise.allSettled(
      existingFactors.totp
        .filter((f) => f.id)
        .map((f) => mfaClient.unenroll({ factorId: f.id! })),
    );
  }
}
