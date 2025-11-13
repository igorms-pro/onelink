import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmailPreferencesSection } from "../EmailPreferencesSection";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock useUserPreferences
const mockUpdatePreference = vi.fn();

vi.mock("../../hooks/useUserPreferences", () => {
  const mockUseUserPreferences = vi.fn(() => ({
    preferences: {
      marketing_emails: false,
      product_updates: true,
    },
    loading: false,
    saving: false,
    updatePreference: mockUpdatePreference,
  }));
  return {
    useUserPreferences: mockUseUserPreferences,
  };
});

describe("EmailPreferencesSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders section with title", () => {
    render(<EmailPreferencesSection />);
    expect(
      screen.getByTestId("settings-email-preferences-section"),
    ).toBeInTheDocument();
    expect(screen.getByText("settings_email_preferences")).toBeInTheDocument();
  });

  it("renders marketing emails toggle", () => {
    render(<EmailPreferencesSection />);
    expect(
      screen.getByTestId("settings-marketing-emails-toggle"),
    ).toBeInTheDocument();
    expect(screen.getByText("settings_marketing_emails")).toBeInTheDocument();
  });

  it("renders product updates toggle", () => {
    render(<EmailPreferencesSection />);
    expect(
      screen.getByTestId("settings-product-updates-toggle"),
    ).toBeInTheDocument();
    expect(screen.getByText("settings_product_updates")).toBeInTheDocument();
  });

  it("displays current preference values", () => {
    render(<EmailPreferencesSection />);
    const marketingToggle = screen.getByTestId(
      "settings-marketing-emails-toggle",
    ) as HTMLInputElement;
    const productToggle = screen.getByTestId(
      "settings-product-updates-toggle",
    ) as HTMLInputElement;
    expect(marketingToggle.checked).toBe(false);
    expect(productToggle.checked).toBe(true);
  });

  it("calls updatePreference when marketing emails toggle is clicked", async () => {
    const user = userEvent.setup();
    render(<EmailPreferencesSection />);
    const marketingToggle = screen.getByTestId(
      "settings-marketing-emails-toggle",
    );
    await user.click(marketingToggle);
    expect(mockUpdatePreference).toHaveBeenCalledWith("marketing_emails", true);
  });

  it("calls updatePreference when product updates toggle is clicked", async () => {
    const user = userEvent.setup();
    render(<EmailPreferencesSection />);
    const productToggle = screen.getByTestId("settings-product-updates-toggle");
    await user.click(productToggle);
    expect(mockUpdatePreference).toHaveBeenCalledWith("product_updates", false);
  });

  it("disables toggles when saving", async () => {
    const { useUserPreferences } = await import(
      "../../hooks/useUserPreferences"
    );
    vi.mocked(useUserPreferences).mockReturnValueOnce({
      preferences: {
        email_notifications: false,
        weekly_digest: false,
        marketing_emails: false,
        product_updates: true,
      },
      loading: false,
      saving: true,
      updatePreference: mockUpdatePreference,
    });
    render(<EmailPreferencesSection />);
    const marketingToggle = screen.getByTestId(
      "settings-marketing-emails-toggle",
    ) as HTMLInputElement;
    const productToggle = screen.getByTestId(
      "settings-product-updates-toggle",
    ) as HTMLInputElement;
    expect(marketingToggle).toBeDisabled();
    expect(productToggle).toBeDisabled();
  });

  it("shows loading skeleton when loading", async () => {
    const { useUserPreferences } = await import(
      "../../hooks/useUserPreferences"
    );
    vi.mocked(useUserPreferences).mockReturnValueOnce({
      preferences: {
        email_notifications: false,
        weekly_digest: false,
        marketing_emails: false,
        product_updates: true,
      },
      loading: true,
      saving: false,
      updatePreference: mockUpdatePreference,
    });
    render(<EmailPreferencesSection />);
    expect(
      screen.getByTestId("settings-email-preferences-section"),
    ).toBeInTheDocument();
    // Check for skeleton loaders
    const skeletons = screen
      .getByTestId("settings-email-preferences-section")
      .querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
