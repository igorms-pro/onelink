import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAsyncOperation } from "@/hooks/useAsyncOperation";
import { useAsyncSubmit } from "@/hooks/useAsyncSubmit";
import type { CustomDomain } from "./DomainList";

interface UseCustomDomainsProps {
  userId: string | null;
}

export function useCustomDomains({ userId }: UseCustomDomainsProps) {
  const { t } = useTranslation();
  const { loading, execute } = useAsyncOperation();
  const { submitting, submit } = useAsyncSubmit();
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [domainInput, setDomainInput] = useState("");
  const [errors, setErrors] = useState<{ domain?: string }>({});

  const loadDomains = useCallback(async () => {
    if (!userId) return;

    await execute(async () => {
      // First get profile_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!profile) {
        return;
      }

      const { data, error } = await supabase
        .from("custom_domains")
        .select("id, domain, verified, created_at")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load domains:", error);
        toast.error(t("settings_domain_load_failed"));
      } else {
        setDomains((data as CustomDomain[]) ?? []);
      }
    });
  }, [userId, t, execute]);

  useEffect(() => {
    if (!userId) return;
    loadDomains();
  }, [userId, loadDomains]);

  const validateDomain = useCallback(
    (domain: string): boolean => {
      const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
      if (!domain.trim()) {
        setErrors({ domain: t("settings_domain_required") });
        return false;
      }
      if (!domainRegex.test(domain.trim())) {
        setErrors({ domain: t("settings_domain_invalid_format") });
        return false;
      }
      setErrors({});
      return true;
    },
    [t],
  );

  const handleAddDomain = useCallback(async () => {
    if (!userId) return;

    const trimmedDomain = domainInput.trim().toLowerCase();
    if (!validateDomain(trimmedDomain)) return;

    await submit(async () => {
      // Get profile_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!profile) {
        toast.error(t("settings_domain_profile_not_found"));
        return;
      }

      const { error } = await supabase
        .from("custom_domains")
        .insert({
          profile_id: profile.id,
          domain: trimmedDomain,
          verified: false,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          toast.error(t("settings_domain_already_exists"));
        } else {
          toast.error(t("settings_domain_add_failed"));
        }
        console.error("Failed to add domain:", error);
        throw error;
      } else {
        toast.success(t("settings_domain_added"));
        setDomainInput("");
        await loadDomains();
      }
    });
  }, [userId, domainInput, validateDomain, loadDomains, submit, t]);

  const handleDeleteDomain = useCallback(
    async (domainId: string, domainName: string) => {
      if (
        !confirm(t("settings_domain_delete_confirm", { domain: domainName }))
      ) {
        return;
      }

      try {
        const { error } = await supabase
          .from("custom_domains")
          .delete()
          .eq("id", domainId);

        if (error) {
          toast.error(t("settings_domain_delete_failed"));
          console.error("Failed to delete domain:", error);
        } else {
          toast.success(t("settings_domain_deleted"));
          setDomains((prev) => prev.filter((d) => d.id !== domainId));
        }
      } catch (e) {
        console.error("Error deleting domain:", e);
        toast.error(t("settings_domain_delete_failed"));
      }
    },
    [t],
  );

  return {
    domains,
    loading,
    submitting,
    domainInput,
    setDomainInput,
    errors,
    setErrors,
    handleAddDomain,
    handleDeleteDomain,
  };
}
