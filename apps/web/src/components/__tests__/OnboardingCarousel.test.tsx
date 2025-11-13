import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { OnboardingCarousel } from "../OnboardingCarousel";

// Mock child components
vi.mock("../ThemeToggleButton", () => ({
  ThemeToggleButton: () => <div data-testid="theme-toggle">Theme</div>,
}));

vi.mock("../LanguageToggleButton", () => ({
  LanguageToggleButton: () => <div data-testid="language-toggle">Language</div>,
}));

// Mock carousel
vi.mock("@/components/ui/carousel", () => ({
  Carousel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="carousel">{children}</div>
  ),
  CarouselContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="carousel-content">{children}</div>
  ),
  CarouselItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="carousel-item">{children}</div>
  ),
}));

// Mock onboarding
vi.mock("@/lib/onboarding", () => ({
  setOnboardingCompleted: vi.fn(),
}));

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("OnboardingCarousel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders carousel with slides", () => {
    const onComplete = vi.fn();

    render(
      <MemoryRouter>
        <OnboardingCarousel onComplete={onComplete} />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("carousel")).toBeInTheDocument();
    expect(screen.getByText("onboarding_welcome_title")).toBeInTheDocument();
  });

  it("calls onComplete and navigates when skip is clicked", async () => {
    const onComplete = vi.fn();
    const { setOnboardingCompleted } = await import("@/lib/onboarding");

    render(
      <MemoryRouter>
        <OnboardingCarousel onComplete={onComplete} />
      </MemoryRouter>,
    );

    const skipButton = screen.getByText("onboarding_skip");
    fireEvent.click(skipButton);

    await waitFor(() => {
      expect(setOnboardingCompleted).toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/auth");
    });
  });

  it("calls onComplete and navigates when get started is clicked", async () => {
    const onComplete = vi.fn();
    const { setOnboardingCompleted } = await import("@/lib/onboarding");

    render(
      <MemoryRouter>
        <OnboardingCarousel onComplete={onComplete} />
      </MemoryRouter>,
    );

    const getStartedButton = screen.getByText("onboarding_getstarted_button");
    fireEvent.click(getStartedButton);

    await waitFor(() => {
      expect(setOnboardingCompleted).toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/auth");
    });
  });

  it("renders all onboarding slides", () => {
    const onComplete = vi.fn();

    render(
      <MemoryRouter>
        <OnboardingCarousel onComplete={onComplete} />
      </MemoryRouter>,
    );

    expect(screen.getByText("onboarding_welcome_title")).toBeInTheDocument();
    expect(screen.getByText("onboarding_routes_title")).toBeInTheDocument();
    expect(screen.getByText("onboarding_files_title")).toBeInTheDocument();
    expect(screen.getByText("onboarding_getstarted_title")).toBeInTheDocument();
  });

  it("renders theme and language toggles", () => {
    const onComplete = vi.fn();

    render(
      <MemoryRouter>
        <OnboardingCarousel onComplete={onComplete} />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
    expect(screen.getByTestId("language-toggle")).toBeInTheDocument();
  });
});
