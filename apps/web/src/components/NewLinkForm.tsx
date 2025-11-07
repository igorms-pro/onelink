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
  limitReached,
}: {
  onCreate: (input: LinkForm) => Promise<void>;
  disabled?: boolean;
  limitReached?: boolean;
}) {
  const { t } = useTranslation();
  const { register, handleSubmit, reset, watch } = useForm<LinkForm>({
    mode: "onChange",
    defaultValues: {
      label: "",
      url: "",
    },
  });

  const watchedValues = watch();
  const label = watchedValues.label || "";
  const url = watchedValues.url || "";

  const isFormValid = label.trim().length >= 3 && url.trim().length > 0;
  const isButtonDisabled = disabled || !isFormValid;

  return (
    <>
      <form
        className={`mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto] ${limitReached ? "opacity-50 pointer-events-none" : ""}`}
        onSubmit={handleSubmit(async (values) => {
          await onCreate(values);
          reset();
        })}
      >
        <input
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all"
          required
          minLength={3}
          placeholder="Label"
          disabled={limitReached}
          {...register("label", {
            required: true,
            minLength: 3,
          })}
        />
        <input
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all"
          required
          placeholder="https://…"
          disabled={limitReached}
          {...register("url", {
            required: true,
          })}
        />
        <button
          type="submit"
          className="rounded-md bg-linear-to-r from-purple-600 to-purple-700 text-white px-3 py-1.5 text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm opacity-100"
          disabled={isButtonDisabled || limitReached}
        >
          {t("dashboard_content_links_add_button")}
        </button>
      </form>
      {limitReached && (
        <p className="mt-2 sm:mt-4 text-sm text-red-600 dark:text-red-400 font-medium">
          {t("dashboard_content_links_limit_reached_upgrade")}
        </p>
      )}
    </>
  );
}
