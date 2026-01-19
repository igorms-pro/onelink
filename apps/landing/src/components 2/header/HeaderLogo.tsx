import { Link } from "react-router-dom";

export function HeaderLogo() {
  return (
    <Link to="/" className="flex items-center gap-2 min-h-[44px] min-w-[44px]">
      <img
        src="/onelink-logo.png"
        alt="OneLink"
        className="h-8 w-auto object-contain"
      />
    </Link>
  );
}
