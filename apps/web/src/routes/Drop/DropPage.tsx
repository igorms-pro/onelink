import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";
import { getDropByToken, getDropFiles } from "@/lib/drops";
import type { DropWithVisibility } from "@/lib/drops";
import { DropHeader } from "./components/DropHeader";
import { DropUploadForm } from "./components/DropUploadForm";
import { DropFileList, type DropFile } from "./components/DropFileList";
import { DropErrorStates } from "./components/DropErrorStates";

interface DropPageProps {
  token: string;
}

export default function DropPage({ token }: DropPageProps) {
  const { user } = useAuth();
  const [drop, setDrop] = useState<DropWithVisibility | null>(null);
  const [files, setFiles] = useState<DropFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch drop and files
  useEffect(() => {
    async function loadDrop() {
      try {
        setLoading(true);
        setError(null);

        const dropData = await getDropByToken(token);
        if (!dropData) {
          setError("not_found");
          return;
        }

        setDrop(dropData);

        // Track drop view (exclude owner views)
        void supabase.from("drop_views").insert([
          {
            drop_id: dropData.id,
            user_id: user?.id ?? null,
            user_agent: navigator.userAgent,
          },
        ]);

        // Load files
        const dropFiles = await getDropFiles(dropData.id);
        setFiles(dropFiles);
      } catch (err) {
        console.error("Failed to load drop:", err);
        setError("error");
      } finally {
        setLoading(false);
      }
    }

    loadDrop();
  }, [token, user]);

  // Refresh files after upload
  const refreshFiles = async () => {
    if (!drop) return;
    const dropFiles = await getDropFiles(drop.id);
    setFiles(dropFiles);
  };

  // Check for error/loading states
  const errorState = (
    <DropErrorStates loading={loading} error={error} drop={drop} />
  );
  if (loading || error || !drop) {
    return errorState;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Gradient blobs background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/5 dark:bg-purple-600/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-pink-300/5 dark:bg-pink-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-300/5 dark:bg-blue-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <DropHeader drop={drop} />

        {/* Upload Form */}
        <div className="mb-8">
          <DropUploadForm drop={drop} onUploadComplete={refreshFiles} />
        </div>

        {/* Files List */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Files ({files.length})
          </h2>
          <DropFileList files={files} />
        </div>
      </div>
    </div>
  );
}
