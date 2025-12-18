import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import "./index.css";
import "./lib/i18n";
import { initSentry } from "./lib/sentry";
import { initPostHog } from "./lib/posthog";
import App from "./routes/App";
import Profile from "./routes/Profile/index";
import Auth from "./routes/Auth";
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

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  </React.StrictMode>,
);
