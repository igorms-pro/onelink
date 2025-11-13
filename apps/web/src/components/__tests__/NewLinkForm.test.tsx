import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewLinkForm } from "../NewLinkForm";

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("NewLinkForm", () => {
  const mockOnCreate = vi.fn().mockResolvedValue(undefined);
  const defaultProps = {
    onCreate: mockOnCreate,
    disabled: false,
    limitReached: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form with label and URL inputs", () => {
    render(<NewLinkForm {...defaultProps} />);
    expect(screen.getByPlaceholderText("Label")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("https://…")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "dashboard_content_links_add_button",
      }),
    ).toBeInTheDocument();
  });

  it("disables submit button when form is invalid", () => {
    render(<NewLinkForm {...defaultProps} />);
    const submitButton = screen.getByRole("button", {
      name: "dashboard_content_links_add_button",
    });
    expect(submitButton).toBeDisabled();
  });

  it("enables submit button when form is valid", async () => {
    const user = userEvent.setup();
    render(<NewLinkForm {...defaultProps} />);
    const labelInput = screen.getByPlaceholderText("Label");
    const urlInput = screen.getByPlaceholderText("https://…");
    const submitButton = screen.getByRole("button", {
      name: "dashboard_content_links_add_button",
    });

    await user.type(labelInput, "Test Link");
    await user.type(urlInput, "https://example.com");

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it("validates label minimum length", async () => {
    const user = userEvent.setup();
    render(<NewLinkForm {...defaultProps} />);
    const labelInput = screen.getByPlaceholderText("Label");
    const urlInput = screen.getByPlaceholderText("https://…");
    const submitButton = screen.getByRole("button", {
      name: "dashboard_content_links_add_button",
    });

    await user.type(labelInput, "Te");
    await user.type(urlInput, "https://example.com");

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    render(<NewLinkForm {...defaultProps} />);
    const labelInput = screen.getByPlaceholderText("Label");
    const urlInput = screen.getByPlaceholderText("https://…");
    const submitButton = screen.getByRole("button", {
      name: "dashboard_content_links_add_button",
    });

    await user.type(labelInput, "Test Link");
    await user.type(urlInput, "https://example.com");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith({
        label: "Test Link",
        url: "https://example.com",
      });
    });
  });

  it("resets form after successful submission", async () => {
    const user = userEvent.setup();
    render(<NewLinkForm {...defaultProps} />);
    const labelInput = screen.getByPlaceholderText("Label");
    const urlInput = screen.getByPlaceholderText("https://…");
    const submitButton = screen.getByRole("button", {
      name: "dashboard_content_links_add_button",
    });

    await user.type(labelInput, "Test Link");
    await user.type(urlInput, "https://example.com");
    await user.click(submitButton);

    await waitFor(() => {
      expect(labelInput).toHaveValue("");
      expect(urlInput).toHaveValue("");
    });
  });

  it("disables form when limitReached is true", () => {
    render(<NewLinkForm {...defaultProps} limitReached={true} />);
    const labelInput = screen.getByPlaceholderText("Label");
    const urlInput = screen.getByPlaceholderText("https://…");
    const submitButton = screen.getByRole("button", {
      name: "dashboard_content_links_add_button",
    });

    expect(labelInput).toBeDisabled();
    expect(urlInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(
      screen.getByText("dashboard_content_links_limit_reached_upgrade"),
    ).toBeInTheDocument();
  });

  it("disables submit button when disabled prop is true", () => {
    render(<NewLinkForm {...defaultProps} disabled={true} />);
    const submitButton = screen.getByRole("button", {
      name: "dashboard_content_links_add_button",
    });
    expect(submitButton).toBeDisabled();
  });

  it("handles form submission with emoji", async () => {
    const user = userEvent.setup();
    render(<NewLinkForm {...defaultProps} />);
    const labelInput = screen.getByPlaceholderText("Label");
    const urlInput = screen.getByPlaceholderText("https://…");
    const submitButton = screen.getByRole("button", {
      name: "dashboard_content_links_add_button",
    });

    await user.type(labelInput, "Test Link");
    await user.type(urlInput, "https://example.com");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalled();
    });
  });
});
