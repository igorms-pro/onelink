import { useEffect } from "react";
import { useForm } from "react-hook-form";

export type ProfileForm = {
  slug: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
};

export function ProfileEditor({ initial, disabled, onSave }: {
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


