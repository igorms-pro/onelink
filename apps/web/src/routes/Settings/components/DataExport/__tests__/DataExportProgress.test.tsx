import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DataExportProgress } from "../DataExportProgress";

describe("DataExportProgress", () => {
  it("renders progress display", () => {
    render(<DataExportProgress progress={50} />);
    expect(screen.getByText("Generating export...")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("displays correct progress percentage", () => {
    const { rerender } = render(<DataExportProgress progress={0} />);
    expect(screen.getByText("0%")).toBeInTheDocument();

    rerender(<DataExportProgress progress={25} />);
    expect(screen.getByText("25%")).toBeInTheDocument();

    rerender(<DataExportProgress progress={100} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("renders progress bar with correct width", () => {
    render(<DataExportProgress progress={75} />);
    const progressBar = screen.getByTestId("data-export-progress-bar");
    expect(progressBar).toHaveStyle({ width: "75%" });
  });

  it("handles edge case: 0% progress", () => {
    render(<DataExportProgress progress={0} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
    const progressBar = screen.getByTestId("data-export-progress-bar");
    expect(progressBar).toHaveStyle({ width: "0%" });
  });

  it("handles edge case: 100% progress", () => {
    render(<DataExportProgress progress={100} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
    const progressBar = screen.getByTestId("data-export-progress-bar");
    expect(progressBar).toHaveStyle({ width: "100%" });
  });
});
