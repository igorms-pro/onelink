import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ActiveSessionsSection } from "../ActiveSessionsSection";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("ActiveSessionsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders section with title", () => {
    renderWithRouter(<ActiveSessionsSection />);
    expect(
      screen.getByTestId("settings-active-sessions-section"),
    ).toBeInTheDocument();
    expect(screen.getByText("settings_active_sessions")).toBeInTheDocument();
  });

  it("renders view sessions button", () => {
    renderWithRouter(<ActiveSessionsSection />);
    expect(screen.getByTestId("settings-view-sessions")).toBeInTheDocument();
    expect(screen.getByText("settings_view_sessions")).toBeInTheDocument();
  });

  it("renders login history button", () => {
    renderWithRouter(<ActiveSessionsSection />);
    expect(screen.getByTestId("settings-login-history")).toBeInTheDocument();
    expect(screen.getByText("settings_login_history")).toBeInTheDocument();
  });

  it("navigates to active sessions when view sessions button is clicked", async () => {
    const user = userEvent.setup();
    renderWithRouter(<ActiveSessionsSection />);
    const viewSessionsButton = screen.getByTestId("settings-view-sessions");
    await user.click(viewSessionsButton);
    expect(mockNavigate).toHaveBeenCalledWith(
      "/settings/sessions#active-sessions",
    );
  });

  it("navigates to login history when login history button is clicked", async () => {
    const user = userEvent.setup();
    renderWithRouter(<ActiveSessionsSection />);
    const loginHistoryButton = screen.getByTestId("settings-login-history");
    await user.click(loginHistoryButton);
    expect(mockNavigate).toHaveBeenCalledWith(
      "/settings/sessions#login-history",
    );
  });
});
