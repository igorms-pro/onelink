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

        <LinksList profileId={profileId} links={links} setLinks={setLinks} />
      </section>

      {/* Analytics */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Analytics</h2>
        <AnalyticsCard profileId={profileId} />
      </section>
    </main>
  );
}

// billing helpers moved to lib/billing
