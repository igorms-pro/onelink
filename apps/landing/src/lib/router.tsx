import { createBrowserRouter } from "react-router-dom";
import HomePage from "@/routes/HomePage";
import FeaturesPage from "@/routes/FeaturesPage";
import PricingPage from "@/routes/PricingPage";
import AuthRedirect from "@/routes/AuthRedirect";
import NotFoundPage from "@/routes/NotFoundPage";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/features", element: <FeaturesPage /> },
  { path: "/pricing", element: <PricingPage /> },
  { path: "/auth", element: <AuthRedirect /> },
  { path: "*", element: <NotFoundPage /> },
]);
