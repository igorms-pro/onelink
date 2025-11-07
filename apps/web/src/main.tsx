import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import "./index.css";
import "./lib/i18n";
import App from "./routes/App";
import Profile from "./routes/Profile/index";
import Auth from "./routes/Auth";
import Dashboard from "./routes/Dashboard/index";
import { AuthProvider } from "./lib/AuthProvider";

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
