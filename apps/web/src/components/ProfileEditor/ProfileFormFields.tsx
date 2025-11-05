import { useTranslation } from "react-i18next";
import type {
  UseFormRegister,
  FieldErrors,
  UseFormClearErrors,
} from "react-hook-form";
import type { ProfileForm } from "./types";

interface ProfileFormFieldsProps {
  register: UseFormRegister<ProfileForm>;
  errors: FieldErrors<ProfileForm>;
  clearErrors: UseFormClearErrors<ProfileForm>;
  showAdditional: boolean;
  onToggleAdditional: () => void;
}

export function ProfileFormFields({
  register,
  errors,
  clearErrors,
  showAdditional,
  onToggleAdditional,
}: ProfileFormFieldsProps) {
  const { t } = useTranslation();
  return (
    <>
      <div>
        <input
          className={`rounded-lg border ${
            errors.slug
              ? "border-red-500 dark:border-red-400"
              : "border-gray-300 dark:border-gray-600"
          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 ${
            errors.slug
              ? "focus:ring-red-500 dark:focus:ring-red-400"
              : "focus:ring-blue-500 dark:focus:ring-blue-400"
          } focus:border-transparent transition-all w-full`}
          required
          placeholder={t("profile_form_slug_placeholder")}
          {...register("slug", {
            onChange: () => {
              if (errors.slug) {
                clearErrors("slug");
              }
            },
          })}
        />
        {errors.slug && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">
            {errors.slug.message}
          </p>
        )}
      </div>
      <div>
        <input
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all w-full"
          required
          placeholder={t("profile_form_display_name_placeholder")}
          {...register("display_name", {
            required: t("profile_form_display_name_required"),
          })}
        />
        {errors.display_name && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">
            {errors.display_name.message}
          </p>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <button
          type="button"
          onClick={onToggleAdditional}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors w-full"
        >
          <span className="font-medium">
            {showAdditional
              ? t("profile_form_hide_additional")
              : t("profile_form_show_additional")}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${
              showAdditional ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {showAdditional && (
        <div className="grid gap-3 transition-all duration-200 ease-in-out">
          <input
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all w-full"
            placeholder={t("profile_form_avatar_url_placeholder")}
            {...register("avatar_url")}
          />
          <textarea
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all resize-none min-h-[80px]"
            placeholder={t("profile_form_bio_placeholder")}
            {...register("bio")}
          />
        </div>
      )}
    </>
  );
}
