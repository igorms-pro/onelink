import { useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthProvider";
import { HeaderMobileSignIn } from "./HeaderMobileSignIn";
import { HeaderMobileDashboard } from "./HeaderMobileDashboard";

interface HeaderProps {
  onSettingsClick?: () => void;
}

export function Header({ onSettingsClick }: HeaderProps) {
  const location = useLocation();
  const { user } = useAuth();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const isSettings = location.pathname.startsWith("/settings");
  const isAuthenticated = !!user;

  if ((isDashboard || isSettings) && isAuthenticated) {
    return <HeaderMobileDashboard onSettingsClick={onSettingsClick} />;
  }

  return <HeaderMobileSignIn />;
}
