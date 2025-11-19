export type TabId = "inbox" | "content" | "account";

export type DropRow = {
  id: string;
  label: string;
  emoji: string | null;
  order: number;
  is_active: boolean;
  is_public: boolean;
  share_token: string | null;
};

export type SubmissionRow = {
  submission_id: string;
  created_at: string;
  drop_id: string;
  drop_label: string | null;
  name: string | null;
  email: string | null;
  note: string | null;
  files: { path: string; size: number; content_type: string | null }[];
};

export type CountRow = {
  drop_id: string;
  drop_label: string | null;
  submissions: number;
};
