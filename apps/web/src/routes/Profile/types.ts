export type PublicLink = {
  link_id: string;
  label: string;
  emoji: string | null;
  url: string;
  order: number;
};

export type PublicProfile = {
  slug?: string;
  display_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  user_id?: string; // Added for isOwner check
};

export type PublicDrop = {
  drop_id: string;
  label: string;
  emoji: string | null;
  order: number;
  max_file_size_mb: number | null;
};

export type ErrorType = "not_found" | "domain_unverified" | null;
