import { useEffect, useState, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
// import { supabase } from "@/lib/supabase"; // Temporarily commented for dummy data
import type { CountRow } from "../types";

type SortField = "label" | "submissions";
type SortDirection = "asc" | "desc";

export function SubmissionCountsCard({
  profileId,
}: {
  profileId: string | null;
}) {
  const [rows, setRows] = useState<Array<CountRow>>([]);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField>("submissions");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    if (!profileId) return;
    setLoading(true);

    // Dummy data for testing
    const dummyData: CountRow[] = [
      { drop_id: "1", drop_label: "Speaker Request", submissions: 12 },
      { drop_id: "2", drop_label: "Resume Submissions", submissions: 8 },
      { drop_id: "3", drop_label: "Design Files", submissions: 5 },
    ];

    setTimeout(() => {
      setRows(dummyData);
      setLoading(false);
    }, 300);

    // Real API call (commented out for now)
    /*
    (async () => {
      try {
        const { data } = await supabase.rpc(
          "get_submission_counts_by_profile",
          { p_profile_id: profileId },
        );
        if (Array.isArray(data)) setRows(data as Array<CountRow>);
        else setRows([]);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
    */
  }, [profileId]);

  // Sort rows based on current sort field and direction
  const sortedRows = useMemo(() => {
    const sorted = [...rows].sort((a, b) => {
      if (sortField === "label") {
        const labelA = (a.drop_label ?? a.drop_id).toLowerCase();
        const labelB = (b.drop_label ?? b.drop_id).toLowerCase();
        return sortDirection === "asc"
          ? labelA.localeCompare(labelB)
          : labelB.localeCompare(labelA);
      } else {
        // Sort by submissions
        return sortDirection === "asc"
          ? a.submissions - b.submissions
          : b.submissions - a.submissions;
      }
    });
    return sorted;
  }, [rows, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to desc for submissions, asc for label
      setSortField(field);
      setSortDirection(field === "submissions" ? "desc" : "asc");
    }
  };

  if (!profileId) return null;

  if (loading) {
    return (
      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading…</p>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="mt-3 rounded-lg bg-gray-50 dark:bg-gray-800 p-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No drop submissions yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex justify-between items-center px-3 pb-0 text-xs font-bold text-gray-700 dark:text-gray-300">
        <button
          onClick={() => handleSort("label")}
          className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <span>Drop</span>
          {sortField === "label" &&
            (sortDirection === "asc" ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            ))}
        </button>
        <button
          onClick={() => handleSort("submissions")}
          className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <span>Submissions</span>
          {sortField === "submissions" &&
            (sortDirection === "asc" ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            ))}
        </button>
      </div>
      {sortedRows.map((r) => (
        <div
          key={r.drop_id}
          className="flex justify-between items-center rounded-lg bg-gray-50 dark:bg-gray-800 p-3 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
        >
          <span className="text-gray-900 dark:text-white text-sm">
            {r.drop_label ?? r.drop_id}
          </span>
          <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
            {r.submissions}
          </span>
        </div>
      ))}
    </div>
  );
}
