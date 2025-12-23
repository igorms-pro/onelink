import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";
import "./index.css";
import "./lib/i18n";
import { router } from "./lib/router";
import { initAnalytics } from "./lib/analytics";

// Initialize analytics
initAnalytics();

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

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </HelmetProvider>
  </React.StrictMode>,
);
