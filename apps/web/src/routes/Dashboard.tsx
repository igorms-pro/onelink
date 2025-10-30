import { useEffect, useState, useRef } from "react";
import { useAuth } from "../lib/AuthProvider";
import { supabase } from "../lib/supabase";
import { useForm } from "react-hook-form";
import { isSafeHttpUrl } from "../lib/domain";
import { getOrCreateProfile, getSelfPlan } from "../lib/profile";

type LinkRow = {
  id: string;
  label: string;
  emoji: string | null;
  url: string;
  order: number;
};

type LinkForm = {
  label: string;
  url: string;
  emoji?: string;
};

type ProfileForm = {
  slug: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
};

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileFormInitial, setProfileFormInitial] = useState<ProfileForm | null>(null);
  const [profileUpdatedAt, setProfileUpdatedAt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const freeLimit = 3;

  const [plan, setPlan] = useState<string>("free");
  const isFree = plan !== "pro";

  // DnD local refs
  const dragIndex = useRef<number | null>(null);
  const overIndex = useRef<number | null>(null);

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
      const p = await getSelfPlan(user.id);
      if (!mounted) return;
      setPlan(p);
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
            {isFree ? "Free" : "Pro"}
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
          disabled={busy || !profileId || (isFree && links.length >= freeLimit)}
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
        {isFree && links.length >= freeLimit && (
          <p className="mt-2 text-sm text-amber-700">
            Free plan limit reached ({freeLimit}). Remove a link or upgrade for unlimited.
          </p>
        )}

        <div className="mt-2 text-sm text-gray-600 h-5">
          {savingOrder && <span>Saving order…</span>}
        </div>
        <ul className="mt-2 grid gap-3">
          {links.map((l, idx) => (
            <li
              key={l.id}
              className="flex items-center justify-between rounded border p-3"
              draggable
              onDragStart={() => { dragIndex.current = idx; }}
              onDragOver={(e) => { e.preventDefault(); overIndex.current = idx; }}
              onDrop={async () => {
                const from = dragIndex.current; const to = overIndex.current;
                dragIndex.current = null; overIndex.current = null;
                if (from == null || to == null || from === to) return;
                const prev = links;
                const next = [...links];
                const [moved] = next.splice(from, 1);
                next.splice(to, 0, moved);
                const reindexed = next.map((x, i) => ({ ...x, order: i + 1 }));
                setLinks(reindexed);
                setSavingOrder(true);
                try {
                  await Promise.all(reindexed.map((row) =>
                    supabase
                      .from("links")
                      .update({ order: row.order })
                      .eq("id", row.id)
                      .eq("profile_id", profileId)
                  ));
                } catch (e) {
                  console.error(e);
                  setLinks(prev);
                  alert("Failed to save order");
                } finally {
                  setSavingOrder(false);
                }
              }}
            >
              <div className="min-w-0 cursor-move">
                <p className="font-medium truncate">{l.emoji ? `${l.emoji} ` : ""}{l.label}</p>
                <a className="text-sm text-blue-600 underline break-all" href={l.url} target="_blank" rel="noreferrer">{l.url}</a>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded border px-2 py-1 text-sm"
                  onClick={async () => {
                    const newLabel = prompt("New label", l.label);
                    if (!newLabel) return;
                    const { error } = await supabase
                      .from("links")
                      .update({ label: newLabel })
                      .eq("id", l.id)
                      .eq("profile_id", profileId);
                    if (error) return alert("Update failed");
                    setLinks(prev => prev.map(x => x.id === l.id ? { ...x, label: newLabel } : x));
                  }}
                >
                  Edit
                </button>
                <button
                  className="rounded border px-2 py-1 text-sm"
                  onClick={async () => {
                    if (!confirm("Delete link?")) return;
                    const { error } = await supabase
                      .from("links")
                      .delete()
                      .eq("id", l.id)
                      .eq("profile_id", profileId);
                    if (error) return alert("Delete failed");
                    setLinks(prev => prev.filter(x => x.id !== l.id));
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
      </section>
    </main>
  );
}

function ProfileEditor({ initial, disabled, onSave }: {
  initial: ProfileForm | null;
  disabled?: boolean;
  onSave: (v: ProfileForm) => Promise<void>;
}) {
  const { register, handleSubmit, reset } = useForm<ProfileForm>({
    values: initial ?? { slug: "", display_name: "", bio: "", avatar_url: "" }
  });
  useEffect(() => {
    if (initial) reset(initial);
  }, [initial, reset]);
  return (
    <form className="mt-4 grid gap-2" onSubmit={handleSubmit(async (v) => { await onSave(v); })}>
      <input className="rounded border px-3 py-2" required placeholder="slug" {...register("slug")} />
      <input className="rounded border px-3 py-2" placeholder="Display name" {...register("display_name")} />
      <input className="rounded border px-3 py-2" placeholder="Avatar URL" {...register("avatar_url")} />
      <textarea className="rounded border px-3 py-2" placeholder="Bio" {...register("bio")} />
      <button className="rounded bg-black text-white px-4 py-2 disabled:opacity-50" disabled={disabled}>Save</button>
    </form>
  );
}

function AnalyticsCard({ profileId }: { profileId: string | null }) {
  type ClickRow = { link_id: string; clicks: number; label?: string };
  const [rows, setRows] = useState<Array<ClickRow>>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
    (async () => {
      try {
        // Placeholder RPC; Agent D to supply implementation
        const { data } = await supabase.rpc("get_clicks_by_profile", { profile_id: profileId, days: 7 });
        if (Array.isArray(data)) setRows(data as Array<ClickRow>);
        else setRows([]);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [profileId]);
  if (!profileId) return <p className="text-sm text-gray-600">Profile not ready.</p>;
  if (loading) return <p className="text-sm text-gray-600">Loading…</p>;
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="text-left p-2">Link</th>
            <th className="text-left p-2">Clicks (7d)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.link_id} className="border-t">
              <td className="p-2">{r.label ?? r.link_id}</td>
              <td className="p-2">{r.clicks}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr className="border-t"><td className="p-2" colSpan={2}>No data</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function NewLinkForm({
  onCreate,
  disabled
}: {
  onCreate: (input: LinkForm) => Promise<void>;
  disabled?: boolean;
}) {
  const { register, handleSubmit, reset } = useForm<LinkForm>();
  return (
    <form
      className="mt-4 grid gap-2 sm:grid-cols-[1fr_2fr_auto]"
      onSubmit={handleSubmit(async (values) => {
        await onCreate(values);
        reset();
      })}
    >
      <input className="rounded border px-3 py-2" placeholder="🚀" {...register("emoji")} />
      <input className="rounded border px-3 py-2" required placeholder="Label" {...register("label")} />
      <input className="rounded border px-3 py-2 sm:col-span-2" required placeholder="https://…" {...register("url")} />
      <button className="rounded bg-black text-white px-4 py-2 disabled:opacity-50" disabled={disabled}>
        Add
      </button>
    </form>
  );
}

async function goToCheckout() {
  const token = (await supabase.auth.getSession()).data.session?.access_token;
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-create-checkout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (data?.url) window.location.href = data.url;
}

async function goToPortal() {
  const token = (await supabase.auth.getSession()).data.session?.access_token;
  const email = (await supabase.auth.getUser()).data.user?.email;
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-portal`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (data?.url) window.location.href = data.url;
}
