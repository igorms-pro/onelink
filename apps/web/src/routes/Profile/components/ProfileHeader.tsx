import type { PublicProfile } from "../types";

interface ProfileHeaderProps {
  profile: PublicProfile | null;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <header className="flex items-center gap-3">
      {profile?.avatar_url && (
        <img className="h-12 w-12 rounded-full" src={profile.avatar_url} />
      )}
      <div>
        <h1 className="text-xl font-semibold">
          {profile?.display_name ?? profile?.slug ?? "Profile"}
        </h1>
        {profile?.bio && <p className="text-gray-600">{profile.bio}</p>}
      </div>
    </header>
  );
}
