import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";

export interface UsernameAvailabilityResult {
  available: boolean | null;
  checking: boolean;
  error: string | null;
}

/**
 * Validates username format
 * @param username - The username to validate
 * @returns Error message if invalid, null if valid
 */
function validateUsername(username: string): string | null {
  if (username.length === 0) {
    return null; // Empty is valid (not checked yet)
  }

  if (username.length < 3) {
    return "Username must be at least 3 characters";
  }

  if (username.length > 30) {
    return "Username must be at most 30 characters";
  }

  // Only allow: a-z, 0-9, -, _
  const validPattern = /^[a-z0-9_-]+$/;
  if (!validPattern.test(username)) {
    return "Username can only contain lowercase letters, numbers, hyphens, and underscores";
  }

  return null;
}

/**
 * Hook to check username availability in real-time with debounce
 * @param username - The username to check
 * @param debounceMs - Debounce delay in milliseconds (default: 500ms)
 * @returns Object with availability status, checking state, and error
 */
export function useUsernameAvailability(
  username: string,
  debounceMs: number = 500,
): UsernameAvailabilityResult {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Reset state for empty username
    if (username.trim().length === 0) {
      setAvailable(null);
      setChecking(false);
      setError(null);
      return;
    }

    // Validate username format
    const validationError = validateUsername(username.trim().toLowerCase());
    if (validationError) {
      setAvailable(false);
      setChecking(false);
      setError(validationError);
      return;
    }

    // Clear previous error if validation passes
    setError(null);
    setChecking(true);
    setAvailable(null);

    // Debounce the check
    timeoutRef.current = setTimeout(async () => {
      const normalizedUsername = username.trim().toLowerCase();

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        // Check if profile with this slug exists
        const { data, error: queryError } = await supabase
          .from("profiles")
          .select("slug")
          .eq("slug", normalizedUsername)
          .maybeSingle();

        // Check if request was aborted
        if (abortControllerRef.current.signal.aborted) {
          return;
        }

        if (queryError) {
          setAvailable(null);
          setError("Failed to check username availability");
          setChecking(false);
          return;
        }

        // If data exists, username is taken; if null, it's available
        setAvailable(data === null);
        setError(null);
      } catch {
        // Check if request was aborted
        if (abortControllerRef.current.signal.aborted) {
          return;
        }

        setAvailable(null);
        setError("Network error. Please try again.");
      } finally {
        if (!abortControllerRef.current.signal.aborted) {
          setChecking(false);
        }
      }
    }, debounceMs);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [username, debounceMs]);

  return { available, checking, error };
}
