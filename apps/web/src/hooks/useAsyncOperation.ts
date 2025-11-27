import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Hook for managing async operations with loading state and cleanup
 * Prevents state updates after component unmount
 */
export function useAsyncOperation<T = void>() {
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (operation: () => Promise<T>): Promise<T | undefined> => {
      if (!mountedRef.current) return undefined;
      setLoading(true);
      try {
        const result = await operation();
        if (mountedRef.current) {
          return result;
        }
        return undefined;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [],
  );

  return { loading, execute };
}
