import { useState, useMemo } from "react";

type SortDirection = "asc" | "desc";

interface UseSortableDataOptions<T> {
  data: T[];
  defaultSortField: keyof T;
  defaultSortDirection?: SortDirection;
}

/**
 * Custom hook for sortable data with field-based sorting
 * Supports alphabetical and numerical sorting
 */
export function useSortableData<
  T extends Record<string, string | number | null>,
>({
  data,
  defaultSortField,
  defaultSortDirection = "desc",
}: UseSortableDataOptions<T>) {
  const [sortField, setSortField] = useState<keyof T>(defaultSortField);
  const [sortDirection, setSortDirection] =
    useState<SortDirection>(defaultSortDirection);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      // Handle string sorting (case-insensitive)
      if (typeof aVal === "string" && typeof bVal === "string") {
        const comparison = aVal.toLowerCase().localeCompare(bVal.toLowerCase());
        return sortDirection === "asc" ? comparison : -comparison;
      }

      // Handle number sorting
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      // Fallback
      return 0;
    });
  }, [data, sortField, sortDirection]);

  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, use default direction
      setSortField(field);
      setSortDirection(defaultSortDirection);
    }
  };

  return {
    sortedData,
    sortField,
    sortDirection,
    handleSort,
  };
}
