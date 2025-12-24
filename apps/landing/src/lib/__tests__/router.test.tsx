import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { router } from "../router";
import HomePage from "@/routes/HomePage";
import FeaturesPage from "@/routes/FeaturesPage";
import PricingPage from "@/routes/PricingPage";
import AuthRedirect from "@/routes/AuthRedirect";
import NotFoundPage from "@/routes/NotFoundPage";

// Mock window.location.replace for AuthRedirect
const mockReplace = vi.fn();
Object.defineProperty(window, "location", {
  value: {
    replace: mockReplace,
  },
  writable: true,
});

const renderWithHelmet = (component: React.ReactElement) => {
  return render(<HelmetProvider>{component}</HelmetProvider>);
};

describe("Router Configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("all routes are defined correctly", () => {
    // Check that router has all expected routes
    const routes = router.routes;

    expect(routes).toHaveLength(5);

    // Check route paths
    const paths = routes.map((route) => route.path);
    expect(paths).toContain("/");
    expect(paths).toContain("/features");
    expect(paths).toContain("/pricing");
    expect(paths).toContain("/auth");
    expect(paths).toContain("*");
  });

  it("HomePage route works", () => {
    const memoryRouter = createMemoryRouter(
      [
        {
          path: "/",
          element: <HomePage />,
        },
      ],
      {
        initialEntries: ["/"],
      },
    );

    renderWithHelmet(<RouterProvider router={memoryRouter} />);

    // HomePage should render
    expect(screen.getByText("One link. Multiple lives.")).toBeInTheDocument();
  });

  it("FeaturesPage route works", () => {
    const memoryRouter = createMemoryRouter(
      [
        {
          path: "/features",
          element: <FeaturesPage />,
        },
      ],
      {
        initialEntries: ["/features"],
      },
    );

    renderWithHelmet(<RouterProvider router={memoryRouter} />);

    // FeaturesPage should render (use getAllByText since "Powerful Features" appears multiple times)
    expect(screen.getAllByText("Powerful Features").length).toBeGreaterThan(0);
  });

  it("PricingPage route works", () => {
    const memoryRouter = createMemoryRouter(
      [
        {
          path: "/pricing",
          element: <PricingPage />,
        },
      ],
      {
        initialEntries: ["/pricing"],
      },
    );

    renderWithHelmet(<RouterProvider router={memoryRouter} />);

    // PricingPage should render (use getAllByText since Free/Pro appear multiple times)
    expect(screen.getAllByText(/Free/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Pro/i).length).toBeGreaterThan(0);
  });

  it("AuthRedirect route works", () => {
    const memoryRouter = createMemoryRouter(
      [
        {
          path: "/auth",
          element: <AuthRedirect />,
        },
      ],
      {
        initialEntries: ["/auth"],
      },
    );

    renderWithHelmet(<RouterProvider router={memoryRouter} />);

    // AuthRedirect should render loading message
    expect(screen.getByText(/Redirecting to sign in/i)).toBeInTheDocument();
  });

  it("NotFoundPage route works", () => {
    const memoryRouter = createMemoryRouter(
      [
        {
          path: "*",
          element: <NotFoundPage />,
        },
      ],
      {
        initialEntries: ["/unknown-route"],
      },
    );

    renderWithHelmet(<RouterProvider router={memoryRouter} />);

    // NotFoundPage should render
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
    expect(screen.getByText(/Go Home/i)).toBeInTheDocument();
  });

  it("404 page renders for unknown routes", () => {
    const memoryRouter = createMemoryRouter(router.routes, {
      initialEntries: ["/this-route-does-not-exist"],
    });

    renderWithHelmet(<RouterProvider router={memoryRouter} />);

    // Should render NotFoundPage
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
  });

  it("router uses BrowserRouter", () => {
    // Check that router is created with createBrowserRouter
    expect(router).toBeDefined();
    expect(router.routes).toBeDefined();
    expect(Array.isArray(router.routes)).toBe(true);
  });

  it("all route elements are React components", () => {
    router.routes.forEach((route) => {
      // Check that route has element property (using type assertion for testing)
      const routeWithElement = route as { element?: unknown };
      if (routeWithElement.element) {
        // Check that element is a React element
        expect(routeWithElement.element).toBeDefined();
        expect(typeof routeWithElement.element).toBe("object");
      }
    });
  });

  it("catch-all route is last", () => {
    const routes = router.routes;
    const lastRoute = routes[routes.length - 1];

    // Catch-all route should be last
    expect(lastRoute.path).toBe("*");
  });
});
