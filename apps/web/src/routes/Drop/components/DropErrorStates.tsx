import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface DropErrorStatesProps {
  loading: boolean;
  error: string | null;
  drop: unknown;
}

export function DropErrorStates({
  loading,
  error,
  drop,
}: DropErrorStatesProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading drop...</p>
        </div>
      </div>
    );
  }

  if (error === "not_found" || !drop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Drop Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The drop you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Error Loading Drop
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            An error occurred while loading the drop. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return null;
}
