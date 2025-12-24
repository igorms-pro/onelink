import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export function Layout({ children, className = "" }: LayoutProps) {
  return (
    <div
      className={`w-full px-2 sm:px-4 md:px-32 lg:px-40 xl:px-48 ${className}`}
    >
      {children}
    </div>
  );
}
