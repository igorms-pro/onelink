import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import "./lib/i18n";
import App from "./routes/App";
import Profile from "./routes/Profile";
import Auth from "./routes/Auth";
import Dashboard from "./routes/Dashboard";
import { AuthProvider } from "./lib/AuthProvider";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/auth", element: <Auth /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/:slug", element: <Profile /> }
]);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
