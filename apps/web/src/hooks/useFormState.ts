import { useState, useCallback, useEffect } from "react";

/**
 * Generic hook for managing form state with validation and reset
 */
export function useFormState<T extends Record<string, unknown>>(
  initialValues: T,
  resetOn?: boolean | unknown,
) {
  const [formData, setFormData] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  useEffect(() => {
    if (resetOn) {
      setFormData(initialValues);
      setErrors({});
      setTouched({});
    }
  }, [resetOn, initialValues]);

  const updateField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const setFieldError = useCallback(
    <K extends keyof T>(key: K, error: string) => {
      setErrors((prev) => ({ ...prev, [key]: error }));
    },
    [],
  );

  const setFieldTouched = useCallback(<K extends keyof T>(key: K) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }, []);

  const reset = useCallback(() => {
    setFormData(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    touched,
    updateField,
    setFieldError,
    setFieldTouched,
    setErrors,
    reset,
    clearErrors,
  };
}
