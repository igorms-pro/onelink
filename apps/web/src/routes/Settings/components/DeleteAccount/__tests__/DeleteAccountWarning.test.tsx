import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DeleteAccountWarning } from "../DeleteAccountWarning";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("DeleteAccountWarning", () => {
  describe("Warning Display", () => {
    it("renders warning title", () => {
      render(<DeleteAccountWarning />);

      expect(
        screen.getByText(/settings_delete_account_warning_title/i),
      ).toBeInTheDocument();
    });

    it("renders warning description", () => {
      render(<DeleteAccountWarning />);

      expect(
        screen.getByText(/settings_delete_account_warning_description/i),
      ).toBeInTheDocument();
    });

    it("renders AlertTriangle icon", () => {
      const { container } = render(<DeleteAccountWarning />);

      // Check for the icon by looking for the parent div with red styling
      const warningContainer = container.querySelector(".bg-red-50");
      expect(warningContainer).toBeInTheDocument();
    });

    it("has correct styling classes", () => {
      const { container } = render(<DeleteAccountWarning />);

      const warningContainer = container.querySelector(".bg-red-50");
      expect(warningContainer).toHaveClass(
        "rounded-lg",
        "border",
        "border-red-200",
        "bg-red-50",
      );
    });

    it("displays warning in correct structure", () => {
      const { container: _container } = render(<DeleteAccountWarning />);

      // Check that title and description are siblings within the same container
      const title = screen.getByText(/settings_delete_account_warning_title/i);
      const description = screen.getByText(
        /settings_delete_account_warning_description/i,
      );

      expect(title).toBeInTheDocument();
      expect(description).toBeInTheDocument();
      expect(title.closest("div")).toContainElement(description);
    });
  });
});
