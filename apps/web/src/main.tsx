import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import * as Sentry from "@sentry/react";
import "./index.css";
import "./lib/i18n";
import { initSentry } from "./lib/sentry";
import { initPostHog } from "./lib/posthog";
import App from "./routes/App";
import Profile from "./routes/Profile/index";
import Auth from "./routes/Auth";
import Welcome from "./routes/Welcome";
import Dashboard from "./routes/Dashboard/index";
import Settings from "./routes/Settings/index";
import BillingPage from "./routes/Settings/pages/BillingPage";
import CustomDomainPage from "./routes/Settings/pages/CustomDomainPage";
import SessionsPage from "./routes/Settings/pages/SessionsPage";
import TwoFactorPage from "./routes/Settings/pages/TwoFactorPage";
import Pricing from "./routes/Pricing";
import Privacy from "./routes/Legal/Privacy";
import Terms from "./routes/Legal/Terms";
import CheckoutSuccess from "./routes/Checkout/Success";
import CheckoutCancel from "./routes/Checkout/Cancel";
import Drop from "./routes/Drop/index";
import { AuthProvider } from "./lib/AuthProvider";

// Initialize Sentry as early as possible (before any other code)
initSentry();

// Initialize PostHog for product analytics
initPostHog();

// Initialize theme on app load
const theme = localStorage.getItem("theme") || "system";
const root = document.documentElement;
let actualTheme = theme;
if (theme === "system") {
  actualTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}
if (actualTheme === "dark") {
  root.classList.add("dark");
  root.setAttribute("data-theme", "dark");
  root.style.colorScheme = "dark";
} else {
  root.classList.remove("dark");
  root.setAttribute("data-theme", "light");
  root.style.colorScheme = "light";
}

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/auth", element: <Auth /> },
  { path: "/welcome", element: <Welcome /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/settings", element: <Settings /> },
  { path: "/settings/billing", element: <BillingPage /> },
  { path: "/settings/domain", element: <CustomDomainPage /> },
  { path: "/settings/sessions", element: <SessionsPage /> },
  { path: "/settings/2fa", element: <TwoFactorPage /> },
  { path: "/pricing", element: <Pricing /> },
  { path: "/privacy", element: <Privacy /> },
  { path: "/terms", element: <Terms /> },
  { path: "/checkout/success", element: <CheckoutSuccess /> },
  { path: "/checkout/cancel", element: <CheckoutCancel /> },
  { path: "/drop/:token", element: <Drop /> },
  { path: "/:slug", element: <Profile /> },
]);

// Error Boundary to catch all React errors
const SentryErrorBoundary = Sentry.withErrorBoundary(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
  {
    fallback: () => (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Something went wrong
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            An error occurred. Please refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    ),
    showDialog: false, // Don't show Sentry dialog, use our custom UI
  },
);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SentryErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </SentryErrorBoundary>
  </React.StrictMode>,
);
