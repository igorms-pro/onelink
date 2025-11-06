import { useEffect, useImperativeHandle, forwardRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ProfileFormFields } from "./ProfileFormFields";
import type { ProfileForm, ProfileEditorRef } from "./types";

export type { ProfileForm, ProfileEditorRef };

export const ProfileEditor = forwardRef<
  ProfileEditorRef,
  {
    initial: ProfileForm | null;
    disabled?: boolean;
    onSave: (v: ProfileForm) => Promise<void>;
  }
>(({ initial, disabled, onSave }, ref) => {
  const [showAdditional, setShowAdditional] = useState(false);
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
    if (initial) {
      reset(initial);
      if (initial.bio || initial.avatar_url) {
        setShowAdditional(true);
      }
    }
  }, [initial, reset]);

  return (
    <form
      className="mt-4 grid gap-3"
      onSubmit={handleSubmit(async (v) => {
        await onSave(v);
      })}
    >
      <ProfileFormFields
        register={register}
        errors={errors}
        clearErrors={clearErrors}
        showAdditional={showAdditional}
        onToggleAdditional={() => setShowAdditional(!showAdditional)}
      />
      <button
        className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2.5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm opacity-100"
        disabled={disabled}
      >
        Save
      </button>
    </form>
  );
});
