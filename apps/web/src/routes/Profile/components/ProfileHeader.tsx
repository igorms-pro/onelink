import type { PublicProfile } from "../types";

interface ProfileHeaderProps {
  profile: PublicProfile | null;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const displayName = profile?.display_name ?? profile?.slug ?? "Profile";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-8">
      {profile?.avatar_url ? (
        <img
          className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover ring-4 ring-white/10 dark:ring-gray-800/50 shadow-lg shrink-0"
          src={profile.avatar_url}
          alt={displayName}
        />
      ) : (
        <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full ring-4 ring-white/10 dark:ring-gray-800/50 shadow-lg shrink-0 bg-gradient-to-br from-purple-500 to-purple-700 dark:from-purple-600 dark:to-purple-800 flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
          {initials}
        </div>
      )}
      <div className="flex-1 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
          {profile?.display_name ?? profile?.slug ?? "Profile"}
        </h1>
        {profile?.bio && (
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
            {profile.bio}
          </p>
        )}
      </div>
    </header>
  );
}
