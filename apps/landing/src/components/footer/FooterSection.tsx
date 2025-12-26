import type { ReactNode } from "react";

export interface FooterSectionProps {
  title: string;
  children: ReactNode;
}

export function FooterSection({ title, children }: FooterSectionProps) {
  return (
    <div>
      <h3 className="text-white font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}
