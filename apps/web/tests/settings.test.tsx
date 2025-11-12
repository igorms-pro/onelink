import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock supabase FIRST before any imports that might use it
vi.mock("../src/lib/supabase", () => ({
  supabase: {
    auth: {
      signOut: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
    })),
    rpc: vi.fn(),
  },
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import Settings from "../src/routes/Settings";
import { ActiveSessionsSection } from "../src/routes/Settings/components/ActiveSessionsSection";
import { BillingSection } from "../src/routes/Settings/components/BillingSection";
import { useUserPreferences } from "../src/routes/Settings/hooks/useUserPreferences";
import { useDashboardData } from "../src/routes/Dashboard/hooks/useDashboardData";
import "../src/lib/i18n";

const mockAuthValue = {
  user: { id: "user-1" },
  loading: false,
  signOut: vi.fn(),
};

vi.mock("../src/routes/Settings/hooks/useUserPreferences", () => ({
  useUserPreferences: vi.fn(),
}));

vi.mock("../src/routes/Dashboard/hooks/useDashboardData", () => ({
  useDashboardData: vi.fn(),
}));

vi.mock("../src/lib/AuthProvider", () => ({
  useAuth: () => mockAuthValue,
}));

vi.mock("../src/components/Header", () => ({
  Header: () => React.createElement("header", { "data-testid": "mock-header" }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const defaultDashboardData = {
  profileId: "profile-id",
  profileFormInitial: null,
  links: [],
  setLinks: vi.fn(),
  drops: [],
  setDrops: vi.fn(),
  submissions: [],
  loading: false,
  plan: "free",
};

const defaultPreferences = {
  email_notifications: true,
  weekly_digest: false,
  marketing_emails: false,
  product_updates: true,
};

beforeEach(() => {
  vi.mocked(useUserPreferences).mockReturnValue({
    preferences: defaultPreferences,
    loading: false,
    saving: false,
    updatePreference: vi.fn(),
    savePreferences: vi.fn(),
  });
  vi.mocked(useDashboardData).mockReturnValue({ ...defaultDashboardData });
  mockAuthValue.user = { id: "user-1" };
});

describe("Settings page", () => {
  it("renders core sections for free plan", () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    expect(
      screen.getByTestId("settings-notifications-section"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("settings-email-preferences-section"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("settings-billing-section")).toBeInTheDocument();
    expect(
      screen.getByTestId("settings-active-sessions-section"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("settings-data-export-section"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("settings-api-integrations-section"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("settings-privacy-security-section"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("settings-custom-domain-section"),
    ).not.toBeInTheDocument();
  });

  it("renders custom domain section for pro plan", () => {
    vi.mocked(useDashboardData).mockReturnValue({
      ...defaultDashboardData,
      plan: "pro",
    });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    expect(
      screen.getByTestId("settings-custom-domain-section"),
    ).toBeInTheDocument();
  });
});

describe("ActiveSessionsSection", () => {
  it("navigates to hashed routes", () => {
    const navigateMock = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);

    render(<ActiveSessionsSection />);

    fireEvent.click(screen.getByTestId("settings-view-sessions"));
    expect(navigateMock).toHaveBeenCalledWith(
      "/settings/sessions#active-sessions",
    );

    fireEvent.click(screen.getByTestId("settings-login-history"));
    expect(navigateMock).toHaveBeenCalledWith(
      "/settings/sessions#login-history",
    );
  });
});

describe("BillingSection", () => {
  it("shows upgrade CTA for free plan", () => {
    render(<BillingSection plan="free" />);
    expect(screen.getByTestId("settings-current-plan-badge").textContent).toBe(
      "Free",
    );
    expect(screen.getByTestId("settings-upgrade-to-pro")).toBeInTheDocument();
  });

  it("shows billing links for pro plan", () => {
    render(<BillingSection plan="pro" />);
    expect(screen.getByTestId("settings-current-plan-badge").textContent).toBe(
      "Pro",
    );
    expect(screen.getByTestId("settings-manage-payment")).toBeInTheDocument();
    expect(screen.getByTestId("settings-billing-history")).toBeInTheDocument();
  });
});
