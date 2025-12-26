import { Link } from "react-router-dom";
import type { FooterLink } from "@/data/footerLinks";

export interface FooterLinksProps {
  links: FooterLink[];
}

export function FooterLinks({ links }: FooterLinksProps) {
  return (
    <ul className="space-y-2">
      {links.map((link, index) => (
        <li key={index}>
          {link.isExternal ? (
            <a
              href={link.href}
              className="hover:text-white transition-colors text-sm"
            >
              {link.label}
            </a>
          ) : link.href.startsWith("/") ? (
            <Link
              to={link.href}
              className="hover:text-white transition-colors text-sm"
            >
              {link.label}
            </Link>
          ) : (
            <a
              href={link.href}
              className="hover:text-white transition-colors text-sm"
            >
              {link.label}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
