import { useEffect } from "react";
import { SEO } from "@/components/SEO";

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.getonelink.io";

export default function TermsPage() {
  useEffect(() => {
    // Redirect to app terms page
    window.location.href = `${APP_URL}/terms`;
  }, []);

  return (
    <SEO
      title="Terms of Service - OneLink"
      description="OneLink Terms of Service"
    >
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <p className="text-lg">Redirecting to Terms of Service...</p>
        </div>
      </div>
    </SEO>
  );
}
