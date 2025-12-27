import { useEffect } from "react";
import { SEO } from "@/components/SEO";

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.getonelink.io";

export default function PrivacyPage() {
  useEffect(() => {
    // Redirect to app privacy page
    window.location.href = `${APP_URL}/privacy`;
  }, []);

  return (
    <SEO title="Privacy Policy - OneLink" description="OneLink Privacy Policy">
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <p className="text-lg">Redirecting to Privacy Policy...</p>
        </div>
      </div>
    </SEO>
  );
}
