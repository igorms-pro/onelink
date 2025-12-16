export type DropWithVisibility = {
  id: string;
  label: string;
  emoji: string | null;
  order: number;
  is_active: boolean;
  is_public: boolean;
  share_token: string | null;
  max_file_size_mb: number | null;
};
