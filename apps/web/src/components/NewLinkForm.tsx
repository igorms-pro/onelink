import { useForm } from "react-hook-form";

export type LinkForm = {
  label: string;
  url: string;
  emoji?: string;
};

export function NewLinkForm({
  onCreate,
  disabled,
}: {
  onCreate: (input: LinkForm) => Promise<void>;
  disabled?: boolean;
}) {
  const { register, handleSubmit, reset } = useForm<LinkForm>();
  return (
    <form
      className="mt-4 grid gap-2 sm:grid-cols-[auto_1fr_1fr_auto]"
      onSubmit={handleSubmit(async (values) => {
        await onCreate(values);
        reset();
      })}
    >
      <input
        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all w-16 text-center"
        placeholder="🚀"
        maxLength={2}
        {...register("emoji")}
      />
      <input
        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
        required
        placeholder="Label"
        {...register("label")}
      />
      <input
        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all sm:col-span-1"
        required
        placeholder="https://…"
        {...register("url")}
      />
      <button
        className="rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2.5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        disabled={disabled}
      >
        Add
      </button>
    </form>
  );
}
