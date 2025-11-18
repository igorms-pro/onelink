import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DropFileList, type DropFile } from "../DropFileList";

const mockFiles: DropFile[] = [
  {
    path: "drop-1/file1.jpg",
    size: 1024,
    content_type: "image/jpeg",
    submission_id: "sub-1",
    created_at: "2024-01-15T10:30:00Z",
    uploaded_by: "John Doe",
  },
  {
    path: "drop-1/file2.pdf",
    size: 2048,
    content_type: "application/pdf",
    submission_id: "sub-2",
    created_at: "2024-01-15T11:00:00Z",
    uploaded_by: null,
  },
];

describe("DropFileList", () => {
  it("renders empty state when no files", () => {
    render(<DropFileList files={[]} />);
    expect(screen.getByText("No files uploaded yet.")).toBeInTheDocument();
  });

  it("renders file list", () => {
    render(<DropFileList files={mockFiles} />);
    expect(screen.getByText("file1.jpg")).toBeInTheDocument();
    expect(screen.getByText("file2.pdf")).toBeInTheDocument();
  });

  it("shows uploaded by when available", () => {
    render(<DropFileList files={mockFiles} />);
    expect(screen.getByText(/by John Doe/)).toBeInTheDocument();
  });

  it("does not show uploaded by when null", () => {
    render(<DropFileList files={[mockFiles[1]]} />);
    expect(screen.queryByText(/by/)).not.toBeInTheDocument();
  });

  it("renders download links", () => {
    render(<DropFileList files={mockFiles} />);
    const links = screen.getAllByLabelText("Download file");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href");
  });
});
