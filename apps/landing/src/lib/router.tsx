import { createBrowserRouter } from "react-router-dom";
import HomePage from "@/routes/HomePage";
// Note: FeaturesPage and PricingPage removed - using anchor links on homepage instead
// If pages become more detailed in the future, uncomment these routes:
// import FeaturesPage from "@/routes/FeaturesPage";
// import PricingPage from "@/routes/PricingPage";
import AuthRedirect from "@/routes/AuthRedirect";
import NotFoundPage from "@/routes/NotFoundPage";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  // { path: "/features", element: <FeaturesPage /> }, // Removed - using #features anchor on homepage
  // { path: "/pricing", element: <PricingPage /> }, // Removed - using #pricing anchor on homepage
  { path: "/auth", element: <AuthRedirect /> },
  { path: "*", element: <NotFoundPage /> },
]);
