import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSortableData } from "../useSortableData";

type TestData = {
  name: string;
  count: number;
  value: number | null;
};

const mockData: TestData[] = [
  { name: "Charlie", count: 30, value: 100 },
  { name: "Alice", count: 10, value: 50 },
  { name: "Bob", count: 20, value: null },
  { name: "David", count: 40, value: 200 },
];

describe("useSortableData", () => {
  it("returns data sorted by default field in default direction", () => {
    const { result } = renderHook(() =>
      useSortableData({
        data: mockData,
        defaultSortField: "count",
        defaultSortDirection: "desc",
      }),
    );

    expect(result.current.sortedData[0].count).toBe(40);
    expect(result.current.sortedData[1].count).toBe(30);
    expect(result.current.sortedData[2].count).toBe(20);
    expect(result.current.sortedData[3].count).toBe(10);
  });

  it("sorts strings alphabetically in ascending order", () => {
    const { result } = renderHook(() =>
      useSortableData({
        data: mockData,
        defaultSortField: "name",
        defaultSortDirection: "asc",
      }),
    );

    expect(result.current.sortedData[0].name).toBe("Alice");
    expect(result.current.sortedData[1].name).toBe("Bob");
    expect(result.current.sortedData[2].name).toBe("Charlie");
    expect(result.current.sortedData[3].name).toBe("David");
  });

  it("sorts strings alphabetically in descending order", () => {
    const { result } = renderHook(() =>
      useSortableData({
        data: mockData,
        defaultSortField: "name",
        defaultSortDirection: "desc",
      }),
    );

    expect(result.current.sortedData[0].name).toBe("David");
    expect(result.current.sortedData[1].name).toBe("Charlie");
    expect(result.current.sortedData[2].name).toBe("Bob");
    expect(result.current.sortedData[3].name).toBe("Alice");
  });

  it("sorts numbers in ascending order", () => {
    const { result } = renderHook(() =>
      useSortableData({
        data: mockData,
        defaultSortField: "count",
        defaultSortDirection: "asc",
      }),
    );

    expect(result.current.sortedData[0].count).toBe(10);
    expect(result.current.sortedData[1].count).toBe(20);
    expect(result.current.sortedData[2].count).toBe(30);
    expect(result.current.sortedData[3].count).toBe(40);
  });

  it("sorts numbers in descending order", () => {
    const { result } = renderHook(() =>
      useSortableData({
        data: mockData,
        defaultSortField: "count",
        defaultSortDirection: "desc",
      }),
    );

    expect(result.current.sortedData[0].count).toBe(40);
    expect(result.current.sortedData[1].count).toBe(30);
    expect(result.current.sortedData[2].count).toBe(20);
    expect(result.current.sortedData[3].count).toBe(10);
  });

  it("toggles sort direction when clicking same field", () => {
    const { result } = renderHook(() =>
      useSortableData({
        data: mockData,
        defaultSortField: "count",
        defaultSortDirection: "desc",
      }),
    );

    expect(result.current.sortDirection).toBe("desc");

    act(() => {
      result.current.handleSort("count");
    });

    expect(result.current.sortDirection).toBe("asc");
    expect(result.current.sortedData[0].count).toBe(10);
  });

  it("sets new field and default direction when clicking different field", () => {
    const { result } = renderHook(() =>
      useSortableData({
        data: mockData,
        defaultSortField: "count",
        defaultSortDirection: "desc",
      }),
    );

    act(() => {
      result.current.handleSort("name");
    });

    expect(result.current.sortField).toBe("name");
    expect(result.current.sortDirection).toBe("desc");
  });

  it("handles case-insensitive string sorting", () => {
    const mixedCaseData: TestData[] = [
      { name: "charlie", count: 30, value: 100 },
      { name: "Alice", count: 10, value: 50 },
      { name: "BOB", count: 20, value: null },
    ];

    const { result } = renderHook(() =>
      useSortableData({
        data: mixedCaseData,
        defaultSortField: "name",
        defaultSortDirection: "asc",
      }),
    );

    expect(result.current.sortedData[0].name).toBe("Alice");
    expect(result.current.sortedData[1].name).toBe("BOB");
    expect(result.current.sortedData[2].name).toBe("charlie");
  });

  it("handles null values in sorting", () => {
    const { result } = renderHook(() =>
      useSortableData({
        data: mockData,
        defaultSortField: "value",
        defaultSortDirection: "asc",
      }),
    );

    // Null values should be handled gracefully
    expect(result.current.sortedData.length).toBe(4);
  });

  it("returns initial sort field and direction", () => {
    const { result } = renderHook(() =>
      useSortableData({
        data: mockData,
        defaultSortField: "name",
        defaultSortDirection: "asc",
      }),
    );

    expect(result.current.sortField).toBe("name");
    expect(result.current.sortDirection).toBe("asc");
  });

  it("defaults to desc direction when not specified", () => {
    const { result } = renderHook(() =>
      useSortableData({
        data: mockData,
        defaultSortField: "count",
      }),
    );

    expect(result.current.sortDirection).toBe("desc");
  });

  it("updates sorted data when input data changes", () => {
    const { result, rerender } = renderHook(
      ({ data }) =>
        useSortableData({
          data,
          defaultSortField: "count",
          defaultSortDirection: "desc",
        }),
      {
        initialProps: { data: mockData },
      },
    );

    expect(result.current.sortedData.length).toBe(4);

    const newData = [...mockData, { name: "Eve", count: 50, value: 300 }];
    rerender({ data: newData });

    expect(result.current.sortedData.length).toBe(5);
    expect(result.current.sortedData[0].count).toBe(50);
  });
});
