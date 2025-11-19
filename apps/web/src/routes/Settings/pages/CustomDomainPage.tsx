import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Globe,
  Trash2,
  CheckCircle2,
  Clock,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { Header } from "@/components/Header";
import { isProPlan } from "@/lib/types/plan";
import { useDashboardData } from "../../Dashboard/hooks/useDashboardData";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface CustomDomain {
  id: string;
  domain: string;
  verified: boolean;
  created_at: string;
}

function DomainStatusBadge({ verified }: { verified: boolean }) {
  const { t } = useTranslation();
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle2 className="w-3 h-3" />
        {t("settings_domain_status_verified")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
      <Clock className="w-3 h-3" />
      {t("settings_domain_status_pending")}
    </span>
  );
}

function DomainSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
    </div>
  );
}

export default function CustomDomainPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { plan, loading: planLoading } = useDashboardData(user?.id ?? null);
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [domainInput, setDomainInput] = useState("");
  const [showHelp, setShowHelp] = useState(false);
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
            {/* Add Domain Form */}
            <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t("settings_domain_add_title")}
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="domain-input"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    {t("settings_domain_label")}
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="domain-input"
                      type="text"
                      value={domainInput}
                      onChange={(e) => {
                        setDomainInput(e.target.value);
                        if (errors.domain) setErrors({});
                      }}
                      placeholder={t("settings_domain_placeholder")}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={submitting}
                    />
                    <button
                      onClick={handleAddDomain}
                      disabled={submitting || !domainInput.trim()}
                      className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                    >
                      {submitting ? t("common_loading") : t("common_add")}
                    </button>
                  </div>
                  {errors.domain && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.domain}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {t("settings_domain_hint")}
                  </p>
                </div>
              </div>
            </section>

            {/* Configured Domains List */}
            <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t("settings_domain_list_title")}
              </h2>
              {domains.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {t("settings_domain_empty")}
                </div>
              ) : (
                <div className="space-y-3">
                  {domains.map((domain) => (
                    <div
                      key={domain.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {domain.domain}
                          </div>
                          <div className="mt-1">
                            <DomainStatusBadge verified={domain.verified} />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleDeleteDomain(domain.id, domain.domain)
                        }
                        className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        aria-label={t("common_delete")}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* DNS Instructions */}
            <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t("settings_domain_dns_title")}
                </h2>
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label={t("settings_domain_help_toggle")}
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
              </div>
              {showHelp && (
                <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                  <div>
                    <h3 className="font-semibold mb-2">
                      {t("settings_domain_dns_subdomain_title")}
                    </h3>
                    <p className="mb-2">
                      {t("settings_domain_dns_subdomain_description")}
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg font-mono text-xs">
                      <div className="mb-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          Type:
                        </span>{" "}
                        CNAME
                      </div>
                      <div className="mb-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          Name:
                        </span>{" "}
                        {domainInput || "subdomain.example.com"}
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Value:
                        </span>{" "}
                        cname.vercel-dns.com
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      {t("settings_domain_dns_apex_title")}
                    </h3>
                    <p className="mb-2">
                      {t("settings_domain_dns_apex_description")}
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg font-mono text-xs">
                      <div className="mb-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          Type:
                        </span>{" "}
                        A
                      </div>
                      <div className="mb-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          Name:
                        </span>{" "}
                        @
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Value:
                        </span>{" "}
                        76.76.21.21
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {t("settings_domain_dns_apex_note")}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("settings_domain_dns_note")}
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
