/**
 * Encryption utilities for sensitive data using Web Crypto API
 * Uses AES-GCM for authenticated encryption
 */

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM

/**
 * Get encryption key from environment variable
 * Falls back to a default key in development (NOT for production)
 */
function getEncryptionKey(): string {
  const envKey = import.meta.env.VITE_ENCRYPTION_KEY;
  if (envKey) {
    return envKey;
  }

  // Development fallback - warn in console
  if (import.meta.env.DEV) {
    console.warn(
      "⚠️ VITE_ENCRYPTION_KEY not set. Using default key (NOT SECURE FOR PRODUCTION)",
    );
    return "default-dev-key-change-in-production";
  }

  throw new Error(
    "VITE_ENCRYPTION_KEY environment variable is required for encryption",
  );
}

/**
 * Derive a CryptoKey from a string key using PBKDF2
 */
async function deriveKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new Uint8Array(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Encrypt plaintext string using AES-GCM
 * Returns base64-encoded string containing: salt + iv + ciphertext
 */
export async function encrypt(plaintext: string): Promise<string> {
  try {
    const keyString = getEncryptionKey();

    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Derive key from password
    const key = await deriveKey(keyString, salt);

    // Encrypt
    const encodedText = new TextEncoder().encode(plaintext);
    const encrypted = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      key,
      encodedText,
    );

    // Combine salt + iv + ciphertext
    const combined = new Uint8Array(
      salt.length + iv.length + encrypted.byteLength,
    );
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypt base64-encoded ciphertext
 * Expects format: salt + iv + ciphertext
 */
export async function decrypt(ciphertext: string): Promise<string> {
  try {
    const keyString = getEncryptionKey();

    // Decode from base64
    const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));

    // Extract salt, IV, and ciphertext
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 16 + IV_LENGTH);
    const encrypted = combined.slice(16 + IV_LENGTH);

    // Derive key from password
    const key = await deriveKey(keyString, salt);

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      key,
      encrypted,
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error(
      "Failed to decrypt data. The data may be corrupted or encrypted with a different key.",
    );
  }
}

/**
 * Encrypt an array of strings (e.g., backup codes)
 * Returns a single encrypted string containing JSON array
 */
export async function encryptArray(items: string[]): Promise<string> {
  const jsonString = JSON.stringify(items);
  return encrypt(jsonString);
}

/**
 * Decrypt an array of strings
 * Expects encrypted JSON array string
 */
export async function decryptArray(ciphertext: string): Promise<string[]> {
  const jsonString = await decrypt(ciphertext);
  try {
    return JSON.parse(jsonString) as string[];
  } catch (error) {
    console.error("Failed to parse decrypted array:", error);
    throw new Error("Failed to decrypt array data");
  }
}
