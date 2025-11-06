import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const { register, handleSubmit, reset } = useForm<LinkForm>();
  return (
    <form
      className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
      onSubmit={handleSubmit(async (values) => {
        await onCreate(values);
        reset();
      })}
    >
      <input
        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all"
        required
        placeholder="Label"
        {...register("label")}
      />
      <input
        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all"
        required
        placeholder="https://…"
        {...register("url")}
      />
      <button
        className="rounded-md bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2.5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm opacity-100"
        disabled={disabled}
      >
        {t("dashboard_content_links_add_button")}
      </button>
    </form>
  );
}
