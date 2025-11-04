import { useEffect, useImperativeHandle, forwardRef } from "react";
import { useForm } from "react-hook-form";

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

export const ProfileEditor = forwardRef<
  ProfileEditorRef,
  {
    initial: ProfileForm | null;
    disabled?: boolean;
    onSave: (v: ProfileForm) => Promise<void>;
  }
>(({ initial, disabled, onSave }, ref) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError: setFormError,
    clearErrors,
  } = useForm<ProfileForm>({
    values: initial ?? { slug: "", display_name: "", bio: "", avatar_url: "" },
  });

  useImperativeHandle(ref, () => ({
    setError: (field, message) => {
      setFormError(field, { type: "manual", message });
    },
    clearError: (field) => {
      clearErrors(field);
    },
  }));

  useEffect(() => {
    if (initial) reset(initial);
  }, [initial, reset]);

  return (
    <form
      className="mt-4 grid gap-3"
      onSubmit={handleSubmit(async (v) => {
        await onSave(v);
      })}
    >
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
          placeholder="slug"
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
      <input
        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
        placeholder="Display name"
        {...register("display_name")}
      />
      <input
        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
        placeholder="Avatar URL"
        {...register("avatar_url")}
      />
      <textarea
        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all resize-none min-h-[80px]"
        placeholder="Bio"
        {...register("bio")}
      />
      <button
        className="rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2.5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        disabled={disabled}
      >
        Save
      </button>
    </form>
  );
});
