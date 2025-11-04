import { DropSubmissionForm } from "./DropSubmissionForm";
import type { PublicDrop } from "../types";

interface DropsSectionProps {
  drops: PublicDrop[];
}

export function DropsSection({ drops }: DropsSectionProps) {
  if (drops.length === 0) return null;

  return (
    <section className="mt-8 grid gap-6">
      {drops.map((d) => (
        <DropSubmissionForm key={d.drop_id} drop={d} />
      ))}
    </section>
  );
}
