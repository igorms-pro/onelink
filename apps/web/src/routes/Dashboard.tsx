import { useEffect, useState } from "react";
import { useAuth } from "../lib/AuthProvider";
import { supabase } from "../lib/supabase";
import { isSafeHttpUrl } from "../lib/domain";
import { getOrCreateProfile, getSelfPlan } from "../lib/profile";
import { ProfileEditor, type ProfileForm } from "../components/ProfileEditor";
import { NewLinkForm } from "../components/NewLinkForm";
import { LinksList, type LinkRow } from "../components/LinksList";
import { AnalyticsCard } from "../components/AnalyticsCard";
import { goToCheckout, goToPortal } from "../lib/billing";

// types moved to components

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const [links, setLinks] = useState<LinkRow[]>([]);
  type DropRow = { id: string; label: string; emoji: string | null; order: number; is_active: boolean };
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
  const [profileFormInitial, setProfileFormInitial] = useState<ProfileForm | null>(null);
  const [profileUpdatedAt, setProfileUpdatedAt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // saving handled within LinksList
  const freeLimit = 3;

  const [plan, setPlan] = useState<string>("free");
  const isFree = plan !== "pro";

  // dnd handled inside LinksList

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
      const sres = await supabase.rpc("get_submissions_by_profile", { p_profile_id: prof.id });
      if (!mounted) return;
      if (sres.error) console.error(sres.error);
      setSubmissions(Array.isArray(sres.data) ? (sres.data as SubmissionRow[]) : []);
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  if (loading) {
    return <main className="mx-auto max-w-md p-6">Loading…</main>;
  }
  if (!user) {
    return (
      <main className="mx-auto max-w-md p-6">
        <h1 className="text-xl font-semibold">Please sign in</h1>
        <a className="text-blue-600 underline" href="/auth">Go to sign in</a>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <span className="rounded-full border px-2 py-0.5 text-xs uppercase tracking-wide">
            Plan: {isFree ? "Free" : "Pro"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isFree ? (
            <button className="rounded border px-3 py-1" onClick={goToCheckout}>Upgrade</button>
          ) : (
            <button className="rounded border px-3 py-1" onClick={goToPortal}>Manage billing</button>
          )}
          <button className="rounded border px-3 py-1" onClick={() => signOut()}>Sign out</button>
        </div>
      </header>

      {/* Profile editor */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Profile</h2>
        <ProfileEditor
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
              alert("Failed to update profile");
              return;
            }
            setProfileUpdatedAt(data?.updated_at ?? new Date().toISOString());
          }}
        />
        {profileUpdatedAt && (
          <p className="mt-2 text-sm text-gray-600">Updated at {new Date(profileUpdatedAt).toLocaleString()}</p>
        )}
      </section>

      {/* Links */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Links</h2>
        <NewLinkForm
          disabled={busy || !profileId || (isFree && (links.length + drops.length) >= freeLimit)}
          onCreate={async (input) => {
            setBusy(true);
            try {
              if (!isSafeHttpUrl(input.url)) {
                alert("Please enter a valid http(s) URL.");
                return;
              }
              const nextOrder = links.length ? Math.max(...links.map(l => l.order)) + 1 : 1;
              const { data, error } = await supabase
                .from("links")
                .insert([{ profile_id: profileId, label: input.label, url: input.url, emoji: input.emoji ?? null, order: nextOrder }])
                .select("id,label,emoji,url,order")
                .single();
              if (error) throw error;
              setLinks((prev) => [...prev, data as LinkRow].sort((a,b)=>a.order-b.order));
            } catch (e) {
              console.error(e);
              alert("Failed to create link");
            } finally {
              setBusy(false);
            }
          }}
        />
        {isFree && (links.length + drops.length) >= freeLimit && (
          <p className="mt-2 text-sm text-amber-700">
            Free plan limit reached ({freeLimit} actions total: {links.length} links + {drops.length} drops). Remove one or upgrade for unlimited.
          </p>
        )}

        <LinksList profileId={profileId} links={links} setLinks={setLinks} />
      </section>

      {/* Drops */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Drops</h2>
        <form
          className="mt-2 grid gap-2 rounded border p-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!profileId) return;
            if (isFree && (links.length + drops.length) >= freeLimit) {
              alert(`Free plan limit reached (${freeLimit} actions). Remove one or upgrade.`);
              return;
            }
            const form = e.currentTarget as HTMLFormElement;
            const fd = new FormData(form);
            const label = String(fd.get("label") || "").trim();
            const emoji = (String(fd.get("emoji") || "").trim() || null) as string | null;
            if (!label) {
              alert("Label is required");
              return;
            }
            setBusy(true);
            try {
              const nextOrder = drops.length ? Math.max(...drops.map(d => d.order)) + 1 : 1;
              const { data, error } = await supabase
                .from("drops")
                .insert([{ profile_id: profileId, label, emoji, order: nextOrder }])
                .select("id,label,emoji,order,is_active")
                .single();
              if (error) throw error;
              setDrops((prev) => [...prev, data as DropRow].sort((a,b)=>a.order-b.order));
              form.reset();
            } catch (e) {
              console.error(e);
              alert("Failed to create drop");
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="grid grid-cols-3 gap-2">
            <input name="label" placeholder="Label (e.g. Upload assets)" className="rounded border px-3 py-2 col-span-2" />
            <input name="emoji" placeholder="Emoji (optional)" className="rounded border px-3 py-2" />
          </div>
          <div>
            <button type="submit" className="rounded border px-3 py-1">Add Drop</button>
          </div>
        </form>

        <ul className="mt-3 grid gap-3">
          {drops.map((d) => (
            <li key={d.id} className="flex items-center justify-between rounded border p-3">
              <div className="min-w-0">
                <p className="font-medium truncate">{d.emoji ? `${d.emoji} ` : ""}{d.label}</p>
                <p className="text-sm text-gray-600">Order {d.order} · {d.is_active ? "Active" : "Off"}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded border px-2 py-1 text-sm"
                  onClick={async () => {
                    const newLabel = prompt("New label", d.label);
                    if (!newLabel) return;
                    const { error } = await supabase
                      .from("drops")
                      .update({ label: newLabel })
                      .eq("id", d.id)
                      .eq("profile_id", profileId);
                    if (error) return alert("Update failed");
                    setDrops(drops.map(x => x.id === d.id ? { ...x, label: newLabel } : x));
                  }}
                >
                  Edit
                </button>
                <button
                  className="rounded border px-2 py-1 text-sm"
                  onClick={async () => {
                    const { data, error } = await supabase
                      .from("drops")
                      .update({ is_active: !d.is_active })
                      .eq("id", d.id)
                      .eq("profile_id", profileId)
                      .select("is_active")
                      .single<{ is_active: boolean }>();
                    if (error) return alert("Toggle failed");
                    setDrops(drops.map(x => x.id === d.id ? { ...x, is_active: data?.is_active ?? !d.is_active } : x));
                  }}
                >
                  {d.is_active ? "Turn off" : "Turn on"}
                </button>
                <button
                  className="rounded border px-2 py-1 text-sm"
                  onClick={async () => {
                    if (!confirm("Delete drop?")) return;
                    const { error } = await supabase
                      .from("drops")
                      .delete()
                      .eq("id", d.id)
                      .eq("profile_id", profileId);
                    if (error) return alert("Delete failed");
                    setDrops(drops.filter(x => x.id !== d.id));
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Analytics */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Analytics</h2>
        <AnalyticsCard profileId={profileId} />
        <SubmissionCountsCard profileId={profileId} />
      </section>

      {/* Inbox */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Inbox</h2>
        {submissions.length === 0 ? (
          <p className="mt-2 text-sm text-gray-600">No submissions yet.</p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {submissions.map((s) => (
              <li key={s.submission_id} className="rounded border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{s.drop_label ?? "Drop"}</p>
                    <p className="text-sm text-gray-600">{new Date(s.created_at).toLocaleString()}</p>
                    <div className="mt-2 grid gap-1 text-sm">
                      {s.name && <p><span className="text-gray-600">Name:</span> {s.name}</p>}
                      {s.email && <p><span className="text-gray-600">Email:</span> {s.email}</p>}
                      {s.note && <p><span className="text-gray-600">Note:</span> {s.note}</p>}
                    </div>
                  </div>
                </div>
                {Array.isArray(s.files) && s.files.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium">Files</p>
                    <ul className="mt-1 grid gap-1 text-sm">
                      {s.files.map((f, idx) => {
                        const pub = supabase.storage.from("drops").getPublicUrl(f.path);
                        const href = pub.data.publicUrl;
                        const name = f.path.split("/").pop();
                        return (
                          <li key={`${s.submission_id}-${idx}`}>
                            <a className="text-blue-600 underline break-all" href={href} target="_blank" rel="noreferrer">
                              {name} {f.size ? `(${Math.round(f.size / 1024)} KB)` : ""}
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
    </main>
  );
}

// billing helpers moved to lib/billing

function SubmissionCountsCard({ profileId }: { profileId: string | null }) {
  type CountRow = { drop_id: string; drop_label: string | null; submissions: number };
  const [rows, setRows] = useState<Array<CountRow>>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
    (async () => {
      try {
        const { data } = await supabase.rpc("get_submission_counts_by_profile", { p_profile_id: profileId });
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
  if (loading) return <p className="mt-3 text-sm text-gray-600">Loading…</p>;
  if (rows.length === 0) return <p className="mt-3 text-sm text-gray-600">No drop submissions yet.</p>;
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="text-left p-2">Drop</th>
            <th className="text-left p-2">Submissions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.drop_id} className="border-t">
              <td className="p-2">{r.drop_label ?? r.drop_id}</td>
              <td className="p-2">{r.submissions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
