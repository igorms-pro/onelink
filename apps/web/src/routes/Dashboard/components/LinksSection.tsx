import { useState } from "react";
import { useTranslation } from "react-i18next";
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

  return (
    <section>
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-purple-50 dark:bg-purple-900/20 p-6 mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {t("dashboard_content_links_title")}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t("dashboard_content_links_description")}
        </p>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
          <NewLinkForm
            disabled={
              busy ||
              !profileId ||
              (isFree && links.length + drops.length >= freeLimit)
            }
            onCreate={async (input) => {
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
                  [...prev, data as LinkRow].sort((a, b) => a.order - b.order),
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
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-purple-50 dark:bg-purple-900/20 p-6">
        <LinksList profileId={profileId} links={links} setLinks={setLinks} />
      </div>
    </section>
  );
}
