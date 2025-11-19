import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DropFileList, type DropFile } from "../DropFileList";

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        getPublicUrl: vi.fn((path: string) => ({
          data: { publicUrl: `https://example.com/storage/drops/${path}` },
        })),
      })),
    },
  },
}));

const mockFiles: DropFile[] = [
  {
    path: "drop-1/file1.jpg",
    size: 1024,
    content_type: "image/jpeg",
    submission_id: "sub-1",
    created_at: "2024-01-15T10:30:00Z",
    uploaded_by: "John Doe",
  },
];

describe("DropFileList", () => {
  it("renders loading state", () => {
    render(<DropFileList files={[]} isLoading={true} />);
    expect(screen.getByText("common_loading")).toBeInTheDocument();
  });

  it("renders empty state when no files", () => {
    render(<DropFileList files={[]} isLoading={false} />);
    expect(
      screen.getByText("dashboard_content_drops_no_files"),
    ).toBeInTheDocument();
  });

  it("renders file list", () => {
    render(<DropFileList files={mockFiles} isLoading={false} />);
    expect(screen.getByText("file1.jpg")).toBeInTheDocument();
  });

  it("shows uploaded by when available", () => {
    render(<DropFileList files={mockFiles} isLoading={false} />);
    expect(
      screen.getByText(/dashboard_content_drops_uploaded_by/),
    ).toBeInTheDocument();
  });
});
