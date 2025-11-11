import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronUp, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isSafeHttpUrl } from "@/lib/domain";
import { NewLinkForm } from "@/components/NewLinkForm";
import { LinksList, type LinkRow } from "@/components/LinksList";
import { toast } from "sonner";
import type { DropRow } from "../types";

interface LinksSectionProps {
  profileId: string | null;
  links: LinkRow[];
  setLinks: React.Dispatch<React.SetStateAction<LinkRow[]>>;
  drops: DropRow[];
  isFree: boolean;
  freeLimit: number;
}

export function LinksSection({
  profileId,
  links,
  setLinks,
  drops,
  isFree,
  freeLimit,
}: LinksSectionProps) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Button should only be disabled by form validation, not free limit
  // Free limit check happens on submit
  const isDisabled = busy || !profileId;
  const limitReached = isFree && links.length + drops.length >= freeLimit;

  return (
    <section>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 mb-2 text-left cursor-pointer"
        aria-label={isExpanded ? t("common_collapse") : t("common_expand")}
      >
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400 shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400 shrink-0" />
        )}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("dashboard_content_links_title")}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t("dashboard_content_links_description")}
          </p>
        </div>
      </button>
      {isExpanded && (
        <>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-purple-50 dark:bg-purple-900/20 p-4 mb-4">
            <NewLinkForm
              disabled={isDisabled}
              limitReached={limitReached}
              onCreate={async (input) => {
                // Check free limit before submitting (backup check)
                if (limitReached) {
                  toast.error(
                    t("dashboard_content_links_limit_reached", {
                      limit: freeLimit,
                      links: links.length,
                      drops: drops.length,
                    }),
                  );
                  return;
                }

                setBusy(true);
                try {
                  if (!isSafeHttpUrl(input.url)) {
                    toast.error(t("dashboard_content_links_invalid_url"));
                    return;
                  }
                  const nextOrder = links.length
                    ? Math.max(...links.map((l) => l.order)) + 1
                    : 1;
                  const { data, error } = await supabase
                    .from("links")
                    .insert([
                      {
                        profile_id: profileId,
                        label: input.label,
                        url: input.url,
                        emoji: input.emoji ?? null,
                        order: nextOrder,
                      },
                    ])
                    .select("id,label,emoji,url,order")
                    .single();
                  if (error) throw error;
                  setLinks((prev) =>
                    [...prev, data as LinkRow].sort(
                      (a, b) => a.order - b.order,
                    ),
                  );
                  toast.success(t("dashboard_content_links_create_success"));
                } catch (e) {
                  console.error(e);
                  toast.error(t("dashboard_content_links_create_failed"));
                } finally {
                  setBusy(false);
                }
              }}
            />
          </div>

          <LinksList profileId={profileId} links={links} setLinks={setLinks} />
        </>
      )}
    </section>
  );
}
