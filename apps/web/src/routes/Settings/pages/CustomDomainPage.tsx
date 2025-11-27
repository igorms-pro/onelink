import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Globe } from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { Header } from "@/components/Header";
import { isProPlan } from "@/lib/types/plan";
import { useDashboardData } from "../../Dashboard/hooks/useDashboardData";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  DomainSkeleton,
  DomainForm,
  DomainList,
  DnsInstructions,
  type CustomDomain,
} from "./CustomDomain";

export default function CustomDomainPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { plan, loading: planLoading } = useDashboardData(user?.id ?? null);
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [domainInput, setDomainInput] = useState("");
  const [errors, setErrors] = useState<{ domain?: string }>({});

  // Redirect if not Pro
  useEffect(() => {
    if (!authLoading && !planLoading && !isProPlan(plan)) {
      navigate("/settings", { replace: true });
    }
  }, [authLoading, planLoading, plan, navigate]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [authLoading, user, navigate]);

  // Load domains
  useEffect(() => {
    if (!user) return;

    let mounted = true;
    setLoading(true);

    (async () => {
      // First get profile_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!mounted || !profile) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("custom_domains")
        .select("id, domain, verified, created_at")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (error) {
        console.error("Failed to load domains:", error);
        toast.error(t("settings_domain_load_failed"));
      } else {
        setDomains((data as CustomDomain[]) ?? []);
      }

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [user, t]);

  const validateDomain = (domain: string): boolean => {
    // Basic domain validation
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
  };

  const handleAddDomain = async () => {
    if (!user) return;

    const trimmedDomain = domainInput.trim().toLowerCase();
    if (!validateDomain(trimmedDomain)) return;

    setSubmitting(true);

    try {
      // Get profile_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) {
        toast.error(t("settings_domain_profile_not_found"));
        setSubmitting(false);
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
          // Unique constraint violation
          toast.error(t("settings_domain_already_exists"));
        } else {
          toast.error(t("settings_domain_add_failed"));
        }
        console.error("Failed to add domain:", error);
      } else {
        toast.success(t("settings_domain_added"));
        setDomainInput("");
        // Reload domains
        const { data: reloaded } = await supabase
          .from("custom_domains")
          .select("id, domain, verified, created_at")
          .eq("profile_id", profile.id)
          .order("created_at", { ascending: false });
        if (reloaded) {
          setDomains(reloaded as CustomDomain[]);
        }
      }
    } catch (e) {
      console.error("Error adding domain:", e);
      toast.error(t("settings_domain_add_failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDomain = async (domainId: string, domainName: string) => {
    if (!confirm(t("settings_domain_delete_confirm", { domain: domainName }))) {
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
        setDomains(domains.filter((d) => d.id !== domainId));
      }
    } catch (e) {
      console.error("Error deleting domain:", e);
      toast.error(t("settings_domain_delete_failed"));
    }
  };

  if (authLoading || planLoading || !user || !isProPlan(plan)) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
      <Header onSettingsClick={() => navigate("/settings")} />
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 md:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all mb-6 cursor-pointer active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("settings_back_to_dashboard")}
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            <h1 className="text-[22px]! font-bold text-gray-900 dark:text-white sm:text-3xl!">
              {t("settings_custom_domain")}
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {t("settings_domain_page_description")}
          </p>
        </div>

        {loading ? (
          <DomainSkeleton />
        ) : (
          <div className="space-y-6">
            <DomainForm
              domainInput={domainInput}
              setDomainInput={setDomainInput}
              onSubmit={handleAddDomain}
              submitting={submitting}
              error={errors.domain}
              onClearError={() => setErrors({})}
            />

            <DomainList domains={domains} onDelete={handleDeleteDomain} />

            <DnsInstructions domainInput={domainInput} />
          </div>
        )}
      </main>
    </div>
  );
}
