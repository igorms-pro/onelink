import { useState, useCallback } from "react";
import { useAsyncOperation } from "./useAsyncOperation";

/**
 * Hook for managing async form submissions with loading state
 */
export function useAsyncSubmit<T = void>() {
  const { loading, execute } = useAsyncOperation<T>();
  const [submitting, setSubmitting] = useState(false);

  const submit = useCallback(
    async (operation: () => Promise<T>): Promise<T | undefined> => {
      setSubmitting(true);
      try {
        const result = await execute(operation);
        return result;
      } finally {
        setSubmitting(false);
      }
    },
    [execute],
  );

  return { loading, submitting, submit };
}
