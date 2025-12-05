/**
 * Type definitions for Supabase MFA
 */

export type MFATotpFactor = {
  id: string;
  friendly_name?: string | null;
  created_at?: string;
  factor_type?: string;
  totp?: {
    qr_code?: string;
    uri?: string;
    secret?: string;
  };
};

export type MFAFactors = {
  totp?: MFATotpFactor[];
};

export type SupabaseMFAState = "inactive" | "enrolling" | "active";

// Types for Supabase MFA API (partial, as Supabase doesn't export full types)
export type MFAEnrollParams = {
  factorType: "totp";
};

export type MFAEnrollResponse = {
  id?: string;
  factor_type?: string;
  friendly_name?: string | null;
  created_at?: string;
  qr_code?: string;
  uri?: string;
  secret?: string;
  totp?: {
    id?: string;
    qr_code?: string;
    uri?: string;
    secret?: string;
    friendly_name?: string | null;
    created_at?: string;
    factor_type?: string;
  };
};

export type MFAVerifyParams = {
  factorId: string;
  code: string;
  challengeId?: string;
};

export type MFAChallengeParams = {
  factorId: string;
};

export type MFAChallengeResponse = {
  id?: string;
};

export type MFAUnenrollParams = {
  factorId: string;
};

// Type guard for Supabase MFA API
export type SupabaseMFAClient = {
  listFactors: () => Promise<{ data?: MFAFactors; error?: unknown }>;
  enroll: (
    params: MFAEnrollParams,
  ) => Promise<{ data?: MFAEnrollResponse; error?: unknown }>;
  verify: (
    params: MFAVerifyParams,
  ) => Promise<{ data?: unknown; error?: unknown }>;
  challenge: (
    params: MFAChallengeParams,
  ) => Promise<{ data?: MFAChallengeResponse; error?: unknown }>;
  unenroll: (
    params: MFAUnenrollParams,
  ) => Promise<{ data?: unknown; error?: unknown }>;
};
