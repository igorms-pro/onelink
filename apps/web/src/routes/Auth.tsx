import { useForm } from "react-hook-form";
import { useState } from "react";
import { useAuth } from "../lib/AuthProvider";

type FormValues = { email: string };

export default function Auth() {
  const { signInWithEmail } = useAuth();
  const { register, handleSubmit } = useForm<FormValues>();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <main className="mx-auto max-w-md p-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Sign in
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          We'll email you a magic link.
        </p>
        <form
          className="mt-6 grid gap-3"
          onSubmit={handleSubmit(async (values) => {
            setError(null);
            const res = await signInWithEmail(values.email);
            if (res.error) setError(res.error);
            else setStatus("Check your email for a sign-in link.");
          })}
        >
          <input
            type="email"
            required
            placeholder="you@example.com"
            className="w-full rounded border px-3 py-2"
            {...register("email")}
          />
          <button className="rounded bg-black text-white px-4 py-2">
            Send link
          </button>
          {status && <p className="text-green-600 text-sm">{status}</p>}
          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          )}
        </form>
      </main>
    </div>
  );
}
