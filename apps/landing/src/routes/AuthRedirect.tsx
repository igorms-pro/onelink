import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to app.getonelink.io/auth
    window.location.replace("https://app.getonelink.io/auth");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Redirecting to sign in...
        </p>
      </div>
    </div>
  );
}
