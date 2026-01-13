import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Welcome from "../Welcome";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock AuthProvider
const mockUser = { id: "user-1", email: "test@example.com" };
vi.mock("@/lib/AuthProvider", () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
  }),
}));

// Mock useUsernameAvailability hook
const mockUseUsernameAvailability = vi.fn();
vi.mock("@/hooks/useUsernameAvailability", () => ({
  useUsernameAvailability: (username: string) =>
    mockUseUsernameAvailability(username),
}));

// Mock supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock components
vi.mock("@/components/HeaderMobileSignIn", () => ({
  HeaderMobileSignIn: () => (
    <div data-testid="header-mobile-sign-in">Header</div>
  ),
}));

vi.mock("@/components/Footer", () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        welcome_title: "Choose your username",
        welcome_description: "Pick a unique username for your OneLink profile",
        welcome_username_placeholder: "username",
        welcome_checking: "Checking availability...",
        welcome_available: "Available",
        welcome_taken: "Username already taken",
        welcome_help_text: "You can always change it later",
        welcome_continue: "Continue",
        welcome_creating: "Creating profile...",
        welcome_error_create_failed:
          "Failed to create profile. Please try again.",
        welcome_profile_created: "Profile created successfully!",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Welcome", () => {
  const mockInvoke = vi.mocked(supabase.functions.invoke);

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    mockUseUsernameAvailability.mockReturnValue({
      available: null,
      checking: false,
      error: null,
    });
  });

  it("renders welcome page with title and description", () => {
    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>,
    );

    expect(screen.getByText("Choose your username")).toBeInTheDocument();
    expect(
      screen.getByText("Pick a unique username for your OneLink profile"),
    ).toBeInTheDocument();
  });

  it("loads username from localStorage on mount", () => {
    localStorageMock.setItem("onelink_pending_username", "testuser");
    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText("username") as HTMLInputElement;
    expect(input.value).toBe("testuser");
  });

  it("shows checking indicator when checking availability", () => {
    mockUseUsernameAvailability.mockReturnValue({
      available: null,
      checking: true,
      error: null,
    });

    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText("username");
    fireEvent.change(input, { target: { value: "testuser" } });

    expect(screen.getByText(/Checking availability/)).toBeInTheDocument();
  });

  it("shows available indicator when username is available", () => {
    mockUseUsernameAvailability.mockReturnValue({
      available: true,
      checking: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText("username");
    fireEvent.change(input, { target: { value: "availableuser" } });

    expect(screen.getByText(/Available/)).toBeInTheDocument();
  });

  it("shows taken indicator when username is taken", () => {
    mockUseUsernameAvailability.mockReturnValue({
      available: false,
      checking: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText("username");
    fireEvent.change(input, { target: { value: "takenuser" } });

    expect(screen.getByText(/Username already taken/)).toBeInTheDocument();
  });

  it("disables submit button when username is invalid", () => {
    mockUseUsernameAvailability.mockReturnValue({
      available: null,
      checking: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>,
    );

    const button = screen.getByRole("button", { name: "Continue" });
    expect(button).toBeDisabled();
  });

  it("disables submit button when username is taken", () => {
    mockUseUsernameAvailability.mockReturnValue({
      available: false,
      checking: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText("username");
    userEvent.type(input, "takenuser");

    const button = screen.getByRole("button", { name: "Continue" });
    expect(button).toBeDisabled();
  });

  it("enables submit button when username is valid and available", () => {
    mockUseUsernameAvailability.mockReturnValue({
      available: true,
      checking: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText("username");
    fireEvent.change(input, { target: { value: "validuser" } });

    const button = screen.getByRole("button", { name: "Continue" });
    expect(button).not.toBeDisabled();
  });

  it("filters invalid characters from username input", () => {
    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText("username") as HTMLInputElement;

    // Trigger onChange with invalid characters
    fireEvent.change(input, { target: { value: "test@user#123" } });

    // Only lowercase letters, numbers, hyphens, and underscores should remain
    expect(input.value).toBe("testuser123");
  });

  it("creates profile successfully and redirects to dashboard", async () => {
    const user = userEvent.setup();
    mockUseUsernameAvailability.mockReturnValue({
      available: true,
      checking: false,
      error: null,
    });

    mockInvoke.mockResolvedValue({
      data: {
        success: true,
        profile: {
          id: "profile-1",
          user_id: "user-1",
          slug: "testuser",
        },
      },
      error: null,
    });

    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText("username");
    fireEvent.change(input, { target: { value: "testuser" } });

    const button = screen.getByRole("button", { name: "Continue" });
    await user.click(button);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("create-profile", {
        method: "POST",
        body: { username: "testuser" },
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Profile created successfully!",
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard", {
        replace: true,
      });
    });

    expect(localStorageMock.getItem("onelink_pending_username")).toBeNull();
  });

  it("shows error when profile creation fails", async () => {
    const user = userEvent.setup();
    mockUseUsernameAvailability.mockReturnValue({
      available: true,
      checking: false,
      error: null,
    });

    mockInvoke.mockResolvedValue({
      data: {
        success: false,
        error: "USERNAME_TAKEN",
        message: "Username is already taken",
      },
      error: null,
    });

    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText("username");
    fireEvent.change(input, { target: { value: "testuser" } });

    const button = screen.getByRole("button", { name: "Continue" });
    await user.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Username is already taken");
    });

    expect(screen.getByText("Username is already taken")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows error when Edge Function returns error", async () => {
    const user = userEvent.setup();
    mockUseUsernameAvailability.mockReturnValue({
      available: true,
      checking: false,
      error: null,
    });

    mockInvoke.mockResolvedValue({
      data: null,
      error: { message: "Network error" },
    });

    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText("username");
    fireEvent.change(input, { target: { value: "testuser" } });

    const button = screen.getByRole("button", { name: "Continue" });
    await user.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Network error");
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows loading state while creating profile", async () => {
    const user = userEvent.setup();
    mockUseUsernameAvailability.mockReturnValue({
      available: true,
      checking: false,
      error: null,
    });

    // Delay the response to test loading state
    mockInvoke.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: {
                success: true,
                profile: { id: "profile-1" },
              },
              error: null,
            });
          }, 100);
        }),
    );

    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText("username");
    fireEvent.change(input, { target: { value: "testuser" } });

    const button = screen.getByRole("button", { name: "Continue" });
    await user.click(button);

    // Button should show loading state
    expect(screen.getByText("Creating profile...")).toBeInTheDocument();
    expect(button).toBeDisabled();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });
});
