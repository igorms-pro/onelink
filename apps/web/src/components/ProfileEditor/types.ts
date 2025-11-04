export type ProfileForm = {
  slug: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
};

export type ProfileEditorRef = {
  setError: (field: keyof ProfileForm, message: string) => void;
  clearError: (field: keyof ProfileForm) => void;
};
