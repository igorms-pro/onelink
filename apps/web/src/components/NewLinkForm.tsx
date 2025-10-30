import { useForm } from "react-hook-form";

export type LinkForm = {
  label: string;
  url: string;
  emoji?: string;
};

export function NewLinkForm({ onCreate, disabled }: {
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


