import { useEffect, useState, useRef } from "react";
import { useAuth } from "../lib/AuthProvider";
import { supabase } from "../lib/supabase";
import { isSafeHttpUrl } from "../lib/domain";
import { getOrCreateProfile, getSelfPlan } from "../lib/profile";
import {
  ProfileEditor,
  type ProfileForm,
  type ProfileEditorRef,
} from "../components/ProfileEditor";
import { NewLinkForm } from "../components/NewLinkForm";
import { LinksList, type LinkRow } from "../components/LinksList";
import { AnalyticsCard } from "../components/AnalyticsCard";
import { goToCheckout, goToPortal } from "../lib/billing";
import { Header } from "../components/Header";
import { toast } from "sonner";

// types moved to components

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const [links, setLinks] = useState<LinkRow[]>([]);
  type DropRow = {
    id: string;
    label: string;
    emoji: string | null;
    order: number;
    is_active: boolean;
  };
  const [drops, setDrops] = useState<DropRow[]>([]);
  type SubmissionRow = {
    submission_id: string;
    created_at: string;
    drop_id: string;
    drop_label: string | null;
    name: string | null;
    email: string | null;
    note: string | null;
    files: { path: string; size: number; content_type: string | null }[];
  };
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileFormInitial, setProfileFormInitial] =
    useState<ProfileForm | null>(null);
  const [profileUpdatedAt, setProfileUpdatedAt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // saving handled within LinksList
  const freeLimit = 3;

  const [plan, setPlan] = useState<string>("free");
  const isFree = plan !== "pro";

  // dnd handled inside LinksList
  const profileEditorRef = useRef<ProfileEditorRef>(null);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    (async () => {
      const prof = await getOrCreateProfile(user.id);
      if (!mounted) return;
      setProfileId(prof.id);
      setProfileFormInitial({
        slug: prof.slug,
        display_name: prof.display_name,
        bio: prof.bio,
        avatar_url: prof.avatar_url,
      });
      const { data, error } = await supabase
        .from("links")
        .select("id,label,emoji,url,order")
        .eq("profile_id", prof.id)
        .order("order", { ascending: true });
      if (!mounted) return;
      if (error) console.error(error);
      setLinks(data ?? []);
      const dres = await supabase
        .from("drops")
        .select("id,label,emoji,order,is_active")
        .eq("profile_id", prof.id)
        .order("order", { ascending: true });
      if (!mounted) return;
      if (dres.error) console.error(dres.error);
      setDrops(dres.data ?? []);
      const p = await getSelfPlan(user.id);
      if (!mounted) return;
      setPlan(p);
      // Load submissions for inbox
      const sres = await supabase.rpc("get_submissions_by_profile", {
        p_profile_id: prof.id,
      });
      if (!mounted) return;
      if (sres.error) console.error(sres.error);
      setSubmissions(
        Array.isArray(sres.data) ? (sres.data as SubmissionRow[]) : [],
      );
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <main className="mx-auto max-w-md p-6 text-gray-900 dark:text-white">
          Loading…
        </main>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <main className="mx-auto max-w-md p-6">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Please sign in
          </h1>
          <a
            className="text-blue-600 dark:text-blue-400 underline"
            href="/auth"
          >
            Go to sign in
          </a>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        ></div>
      </div>

      <div className="relative z-10">
        <Header />
        <main className="flex-1 mx-auto max-w-4xl w-full p-4 md:p-6 lg:p-8">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-gray-200/60 dark:border-gray-800/60">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <span className="rounded-full border border-gray-200/80 dark:border-gray-700/80 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 backdrop-blur-sm text-gray-700 dark:text-gray-300 px-3 py-1 text-xs font-medium uppercase tracking-wide shadow-sm">
                {isFree ? "Free" : "Pro"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isFree ? (
                <button
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
                  onClick={goToCheckout}
                >
                  Upgrade to Pro
                </button>
              ) : (
                <button
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
                  onClick={goToPortal}
                >
                  Manage billing
                </button>
              )}
              <button
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => signOut()}
              >
                Sign out
              </button>
            </div>
          </header>
          {/* Inbox */}
          <section className="mt-8 rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-lg shadow-gray-200/50 dark:shadow-black/20 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Inbox
              </h2>
              <span className="rounded-full border border-gray-200/80 dark:border-gray-700/80 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 backdrop-blur-sm text-gray-700 dark:text-gray-300 px-3 py-1 text-xs font-medium uppercase tracking-wide shadow-sm">
                {submissions.length}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              View and manage file submissions
            </p>
            {submissions.length === 0 ? (
              <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No submissions yet.
                </p>
              </div>
            ) : (
              <ul className="mt-4 grid gap-3">
                {submissions.map((s) => (
                  <li
                    key={s.submission_id}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium truncate text-gray-900 dark:text-white">
                          {s.drop_label ?? "Drop"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(s.created_at).toLocaleString()}
                        </p>
                        <div className="mt-2 grid gap-1 text-sm">
                          {s.name && (
                            <p className="text-gray-700 dark:text-gray-300">
                              <span className="text-gray-600 dark:text-gray-400">
                                Name:
                              </span>{" "}
                              {s.name}
                            </p>
                          )}
                          {s.email && (
                            <p className="text-gray-700 dark:text-gray-300">
                              <span className="text-gray-600 dark:text-gray-400">
                                Email:
                              </span>{" "}
                              {s.email}
                            </p>
                          )}
                          {s.note && (
                            <p className="text-gray-700 dark:text-gray-300">
                              <span className="text-gray-600 dark:text-gray-400">
                                Note:
                              </span>{" "}
                              {s.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {Array.isArray(s.files) && s.files.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          Files ({s.files.length})
                        </p>
                        <ul className="grid gap-2">
                          {s.files.map((f, idx) => {
                            const pub = supabase.storage
                              .from("drops")
                              .getPublicUrl(f.path);
                            const href = pub.data.publicUrl;
                            const name = f.path.split("/").pop();
                            return (
                              <li key={`${s.submission_id}-${idx}`}>
                                <a
                                  className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline break-all text-sm font-medium"
                                  href={href}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <span className="truncate">{name}</span>
                                  {f.size && (
                                    <span className="text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                                      ({Math.round(f.size / 1024)} KB)
                                    </span>
                                  )}
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Profile editor */}
          <section className="mt-8 rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-lg shadow-gray-200/50 dark:shadow-black/20 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Profile
              </h2>
              {profileFormInitial?.slug && (
                <a
                  href={`/${profileFormInitial.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  View my profile →
                </a>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Manage your public profile settings
            </p>
            <ProfileEditor
              ref={profileEditorRef}
              initial={profileFormInitial}
              disabled={!profileId}
              onSave={async (values) => {
                if (!profileId) return;
                const { data, error } = await supabase
                  .from("profiles")
                  .update({
                    slug: values.slug,
                    display_name: values.display_name,
                    bio: values.bio,
                    avatar_url: values.avatar_url,
                  })
                  .eq("id", profileId)
                  .select("updated_at")
                  .single<{ updated_at: string }>();
                if (error) {
                  // Check for PostgreSQL unique constraint violation (error code 23505)
                  if (
                    error.code === "23505" &&
                    (error.message?.includes("slug") ||
                      error.message?.includes("profiles_slug_key") ||
                      error.message?.includes("unique") ||
                      error.message?.toLowerCase().includes("slug"))
                  ) {
                    const errorMessage =
                      "This slug is already taken. Please choose another.";
                    profileEditorRef.current?.setError("slug", errorMessage);
                    toast.error(errorMessage);
                  } else {
                    toast.error("Failed to update profile");
                  }
                  return;
                }
                toast.success("Profile updated successfully");
                setProfileUpdatedAt(
                  data?.updated_at ?? new Date().toISOString(),
                );
              }}
            />
            {profileUpdatedAt && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Updated at {new Date(profileUpdatedAt).toLocaleString()}
              </p>
            )}
          </section>

          {/* Links */}
          <section className="mt-8 rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-lg shadow-gray-200/50 dark:shadow-black/20 hover:shadow-xl transition-shadow">
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
                    [...prev, data as LinkRow].sort(
                      (a, b) => a.order - b.order,
                    ),
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

            <LinksList
              profileId={profileId}
              links={links}
              setLinks={setLinks}
            />
          </section>

          {/* Drops */}
          <section className="mt-8 rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-lg shadow-gray-200/50 dark:shadow-black/20 hover:shadow-xl transition-shadow">
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
                      { profile_id: profileId, label, emoji, order: nextOrder },
                    ])
                    .select("id,label,emoji,order,is_active")
                    .single();
                  if (error) throw error;
                  setDrops((prev) =>
                    [...prev, data as DropRow].sort(
                      (a, b) => a.order - b.order,
                    ),
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

          {/* Analytics */}
          <section className="mt-8 rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-lg shadow-gray-200/50 dark:shadow-black/20 hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Analytics
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Track your link clicks and submissions
            </p>
            <AnalyticsCard profileId={profileId} />
            <SubmissionCountsCard profileId={profileId} />
          </section>
        </main>
      </div>
    </div>
  );
}

// billing helpers moved to lib/billing

function SubmissionCountsCard({ profileId }: { profileId: string | null }) {
  type CountRow = {
    drop_id: string;
    drop_label: string | null;
    submissions: number;
  };
  const [rows, setRows] = useState<Array<CountRow>>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
    (async () => {
      try {
        const { data } = await supabase.rpc(
          "get_submission_counts_by_profile",
          { p_profile_id: profileId },
        );
        if (Array.isArray(data)) setRows(data as Array<CountRow>);
        else setRows([]);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [profileId]);
  if (!profileId) return null;
  if (loading)
    return (
      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading…</p>
    );
  if (rows.length === 0)
    return (
      <div className="mt-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No drop submissions yet.
        </p>
      </div>
    );
  return (
    <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">
              Drop
            </th>
            <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">
              Submissions
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.drop_id}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
            >
              <td className="p-3 text-gray-900 dark:text-white">
                {r.drop_label ?? r.drop_id}
              </td>
              <td className="p-3 text-gray-700 dark:text-gray-300 font-medium">
                {r.submissions}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
