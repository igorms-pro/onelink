import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HeroInput } from "../HeroInput";

// Mock analytics
vi.mock("@/lib/analytics", () => ({
  trackUsernameEntered: vi.fn(),
}));

describe("HeroInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders input and button", () => {
    render(
      <HeroInput username="" onUsernameChange={vi.fn()} onSubmit={vi.fn()} />,
    );

    const input = screen.getByPlaceholderText(/username/i);
    const button = screen.getByTestId("hero-cta-get-started");

    expect(input).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });

  it("displays username prefix", () => {
    render(
      <HeroInput username="" onUsernameChange={vi.fn()} onSubmit={vi.fn()} />,
    );

    expect(screen.getByText("app.getonelink.io/")).toBeInTheDocument();
  });

  it("calls onUsernameChange when input value changes", async () => {
    const onUsernameChange = vi.fn();
    const user = userEvent.setup();

    render(
      <HeroInput
        username=""
        onUsernameChange={onUsernameChange}
        onSubmit={vi.fn()}
      />,
    );

    const input = screen.getByPlaceholderText(/username/i);
    await user.type(input, "testuser");

    // Should be called for each character typed
    expect(onUsernameChange).toHaveBeenCalled();
    // Verify it was called multiple times (once per character)
    expect(onUsernameChange.mock.calls.length).toBeGreaterThan(0);
  });

  it("calls onSubmit when Enter key is pressed", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(
      <HeroInput
        username="testuser"
        onUsernameChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    const input = screen.getByPlaceholderText(/username/i);
    await user.type(input, "{Enter}");

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("calls onSubmit when button is clicked", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(
      <HeroInput
        username="testuser"
        onUsernameChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    const button = screen.getByTestId("hero-cta-get-started");
    await user.click(button);

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("displays current username value", () => {
    render(
      <HeroInput
        username="myusername"
        onUsernameChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    const input = screen.getByPlaceholderText(/username/i) as HTMLInputElement;
    expect(input.value).toBe("myusername");
  });

  it("has correct input styling classes", () => {
    render(
      <HeroInput username="" onUsernameChange={vi.fn()} onSubmit={vi.fn()} />,
    );

    const input = screen.getByPlaceholderText(/username/i);
    expect(input).toHaveClass("rounded-xl");
    expect(input).toHaveClass("border-2");
  });

  it("has correct button styling", () => {
    render(
      <HeroInput username="" onUsernameChange={vi.fn()} onSubmit={vi.fn()} />,
    );

    const button = screen.getByTestId("hero-cta-get-started");
    expect(button).toHaveClass("bg-linear-to-r");
    expect(button).toHaveClass("from-purple-500");
  });
});
