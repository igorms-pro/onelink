import { useState } from "react";
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
  const [busy, setBusy] = useState(false);

  return (
    <section className="rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-lg shadow-gray-200/50 dark:shadow-black/20 hover:shadow-xl transition-shadow">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Links
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Create buttons that link to your content
      </p>
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
              toast.error("Please enter a valid http(s) URL.");
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
            toast.success("Link created successfully");
          } catch (e) {
            console.error(e);
            toast.error("Failed to create link");
          } finally {
            setBusy(false);
          }
        }}
      />
      {isFree && links.length + drops.length >= freeLimit && (
        <div className="mt-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3">
          <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
            ⚠️ Free plan limit reached ({freeLimit} actions total:{" "}
            {links.length} links + {drops.length} drops)
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
            Remove one or upgrade to Pro for unlimited actions.
          </p>
        </div>
      )}

      <LinksList profileId={profileId} links={links} setLinks={setLinks} />
    </section>
  );
}
