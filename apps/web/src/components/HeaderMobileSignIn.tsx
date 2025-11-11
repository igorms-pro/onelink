import { ThemeToggleButton } from "./ThemeToggleButton";
import { LanguageToggleButton } from "./LanguageToggleButton";

export function HeaderMobileSignIn() {
  return (
    <header className="w-full relative z-50">
      <div className="mx-auto max-w-lg w-full flex items-center justify-end py-4 md:py-6 lg:py-8">
        <div className="flex items-center gap-2 relative z-50 ">
          <ThemeToggleButton />
          <LanguageToggleButton />
        </div>
      </div>
    </header>
  );
}
