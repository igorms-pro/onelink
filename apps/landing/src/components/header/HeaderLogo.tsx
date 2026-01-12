import { Link } from "react-router-dom";

export function HeaderLogo() {
  return (
    <Link to="/" className="flex items-center gap-2 min-h-[44px] min-w-[44px]">
      <img
        src="/onelink-logo-128.png"
        alt="OneLink"
        className="h-10 sm:h-12 w-auto object-contain dark:hidden"
      />
      <img
        src="/onelink-logo-white-128.png"
        alt="OneLink"
        className="h-10 sm:h-12 w-auto object-contain hidden dark:block"
      />
    </Link>
  );
}
