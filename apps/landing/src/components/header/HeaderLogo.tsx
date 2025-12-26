import { Link } from "react-router-dom";

export function HeaderLogo() {
  return (
    <Link to="/" className="flex items-center gap-2 min-h-[44px] min-w-[44px]">
      <span className="text-xl font-bold bg-linear-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
        OneLink
      </span>
    </Link>
  );
}
