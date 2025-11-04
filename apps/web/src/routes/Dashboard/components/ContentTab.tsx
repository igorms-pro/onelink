import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { isSafeHttpUrl } from "@/lib/domain";
import { NewLinkForm } from "@/components/NewLinkForm";
import { LinksList, type LinkRow } from "@/components/LinksList";
import { toast } from "sonner";
import type { DropRow } from "../types";

interface ContentTabProps {
  profileId: string | null;
  links: LinkRow[];
  setLinks: React.Dispatch<React.SetStateAction<LinkRow[]>>;
  drops: DropRow[];
  setDrops: React.Dispatch<React.SetStateAction<DropRow[]>>;
  isFree: boolean;
  freeLimit: number;
}

export function ContentTab({
  profileId,
  links,
  setLinks,
  drops,
  setDrops,
  isFree,
  freeLimit,
}: ContentTabProps) {
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-8">
      {/* Links */}
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

      {/* Drops */}
      <section className="rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-lg shadow-gray-200/50 dark:shadow-black/20 hover:shadow-xl transition-shadow">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Drops
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Create file inboxes for people to submit files
        </p>
        <form
          className="mt-4 grid gap-3 rounded-lg border border-gray-200/60 dark:border-gray-700/60 bg-linear-to-br from-gray-50/80 to-white/80 dark:from-gray-900/50 dark:to-gray-950/50 backdrop-blur-sm p-4 shadow-sm"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!profileId) return;
            if (isFree && links.length + drops.length >= freeLimit) {
              toast.error(
                `Free plan limit reached (${freeLimit} actions). Remove one or upgrade.`,
              );
              return;
            }
            const form = e.currentTarget as HTMLFormElement;
            const fd = new FormData(form);
            const label = String(fd.get("label") || "").trim();
            const emoji = (String(fd.get("emoji") || "").trim() || null) as
              | string
              | null;
            if (!label) {
              toast.error("Label is required");
              return;
            }
            setBusy(true);
            try {
              const nextOrder = drops.length
                ? Math.max(...drops.map((d) => d.order)) + 1
                : 1;
              const { data, error } = await supabase
                .from("drops")
                .insert([
                  {
                    profile_id: profileId,
                    label,
                    emoji,
                    order: nextOrder,
                  },
                ])
                .select("id,label,emoji,order,is_active")
                .single();
              if (error) throw error;
              setDrops((prev) =>
                [...prev, data as DropRow].sort((a, b) => a.order - b.order),
              );
              form.reset();
              toast.success("Drop created successfully");
            } catch (e) {
              console.error(e);
              toast.error("Failed to create drop");
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="grid grid-cols-3 gap-2">
            <input
              name="label"
              placeholder="Label (e.g. Upload assets)"
              className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 col-span-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
            <input
              name="emoji"
              placeholder="Emoji (optional)"
              className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
          </div>
          <div>
            <button
              type="submit"
              className="rounded border border-gray-300 dark:border-gray-600 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Add Drop
            </button>
          </div>
        </form>

        <ul className="mt-4 grid gap-2">
          {drops.length === 0 ? (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No drops yet. Create your first drop above!
              </p>
            </div>
          ) : (
            drops.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-sm transition-shadow"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate text-gray-900 dark:text-white">
                    {d.emoji ? `${d.emoji} ` : ""}
                    {d.label}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Order {d.order} · {d.is_active ? "Active" : "Off"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    onClick={async () => {
                      const newLabel = prompt("New label", d.label);
                      if (!newLabel) return;
                      const { error } = await supabase
                        .from("drops")
                        .update({ label: newLabel })
                        .eq("id", d.id)
                        .eq("profile_id", profileId);
                      if (error) {
                        toast.error("Update failed");
                        return;
                      }
                      setDrops(
                        drops.map((x) =>
                          x.id === d.id ? { ...x, label: newLabel } : x,
                        ),
                      );
                      toast.success("Drop updated");
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    onClick={async () => {
                      const { data, error } = await supabase
                        .from("drops")
                        .update({ is_active: !d.is_active })
                        .eq("id", d.id)
                        .eq("profile_id", profileId)
                        .select("is_active")
                        .single<{ is_active: boolean }>();
                      if (error) {
                        toast.error("Toggle failed");
                        return;
                      }
                      setDrops(
                        drops.map((x) =>
                          x.id === d.id
                            ? {
                                ...x,
                                is_active: data?.is_active ?? !d.is_active,
                              }
                            : x,
                        ),
                      );
                      toast.success(
                        `Drop ${data?.is_active ? "activated" : "deactivated"}`,
                      );
                    }}
                  >
                    {d.is_active ? "Turn off" : "Turn on"}
                  </button>
                  <button
                    className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 px-3 py-1.5 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    onClick={async () => {
                      if (!confirm("Delete drop?")) return;
                      const { error } = await supabase
                        .from("drops")
                        .delete()
                        .eq("id", d.id)
                        .eq("profile_id", profileId);
                      if (error) {
                        toast.error("Delete failed");
                        return;
                      }
                      setDrops(drops.filter((x) => x.id !== d.id));
                      toast.success("Drop deleted");
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
