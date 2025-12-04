// Legacy custom 2FA hook (TOTP + encrypted secrets in user_2fa table)
// NOTE: This hook is no longer used now that we migrated to Supabase MFA.
// It is kept temporarily for reference and will be removed after confirming
// that no production data relies on the old user_2fa table.

export {};
