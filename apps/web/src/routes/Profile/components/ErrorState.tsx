import { Header } from "@/components/Header";
import type { ErrorType } from "../types";

interface ErrorStateProps {
  errorType: ErrorType;
}

export function ErrorState({ errorType }: ErrorStateProps) {
  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 dark:opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        ></div>
      </div>
      <div className="relative z-10">
        <Header />
        <main className="flex-1 mx-auto max-w-md w-full p-6 flex items-center justify-center min-h-[60vh]">
          <div className="rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 shadow-lg shadow-gray-200/50 dark:shadow-black/20 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {errorType === "domain_unverified"
                ? "Domain not verified"
                : "Profile not found"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {errorType === "domain_unverified"
                ? "This domain exists but hasn't been verified yet. Please contact the owner."
                : "The profile you're looking for doesn't exist or has been removed."}
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
            >
              Go home
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}
