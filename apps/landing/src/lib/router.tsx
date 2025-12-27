import { createBrowserRouter } from "react-router-dom";
import HomePage from "@/routes/HomePage";
import FeaturesPage from "@/routes/FeaturesPage";
import PricingPage from "@/routes/PricingPage";
import AuthRedirect from "@/routes/AuthRedirect";
import PrivacyPage from "@/routes/PrivacyPage";
import TermsPage from "@/routes/TermsPage";
import NotFoundPage from "@/routes/NotFoundPage";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/features", element: <FeaturesPage /> },
  { path: "/pricing", element: <PricingPage /> },
  { path: "/auth", element: <AuthRedirect /> },
  { path: "/privacy", element: <PrivacyPage /> },
  { path: "/terms", element: <TermsPage /> },
  { path: "*", element: <NotFoundPage /> },
]);
