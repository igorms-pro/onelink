import { supabase } from "@/lib/supabase";
import type { PublicDrop } from "../types";

interface DropSubmissionFormProps {
  drop: PublicDrop;
}

export function DropSubmissionForm({ drop }: DropSubmissionFormProps) {
  return (
    <form
      className="rounded border p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const formData = new FormData(form);
        const name = (formData.get("name") as string) || null;
        const email = (formData.get("email") as string) || null;
        const note = (formData.get("note") as string) || null;
        const filesInput = form.querySelector(
          'input[name="files"]',
        ) as HTMLInputElement | null;
        const files = filesInput?.files ? Array.from(filesInput.files) : [];
        const maxSizeMB = drop.max_file_size_mb ?? 50;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        // Client-side validation
        for (const f of files) {
          if (f.size > maxSizeBytes) {
            alert(`File "${f.name}" exceeds ${maxSizeMB}MB limit.`);
            return;
          }
          const ext = f.name.split(".").pop()?.toLowerCase() || "";
          const blocked = [
            "exe",
            "bat",
            "cmd",
            "com",
            "pif",
            "scr",
            "vbs",
            "js",
            "jar",
            "app",
            "dmg",
          ];
          if (blocked.includes(ext)) {
            alert(`File type .${ext} is not allowed.`);
            return;
          }
        }

        try {
          // Upload files to Supabase Storage
          const uploaded: {
            path: string;
            size: number;
            content_type: string | null;
          }[] = [];
          for (const f of files) {
            const ext = f.name.split(".").pop() || "bin";
            const key = `${drop.drop_id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
            const { error: upErr } = await supabase.storage
              .from("drops")
              .upload(key, f, {
                contentType: f.type || undefined,
                upsert: false,
              });
            if (upErr) throw upErr;
            uploaded.push({
              path: key,
              size: f.size,
              content_type: f.type || null,
            });
          }

          // Create submission row
          const { error } = await supabase.from("submissions").insert([
            {
              drop_id: drop.drop_id,
              name,
              email,
              note,
              files: uploaded,
              user_agent: navigator.userAgent,
            },
          ]);
          if (error) throw error;
          alert("Submitted successfully.");
          form.reset();
        } catch (err) {
          console.error(err);
          alert("Submission failed");
        }
      }}
    >
      <h2 className="font-medium mb-2">
        {drop.emoji ? `${drop.emoji} ` : ""}
        {drop.label}
      </h2>
      <div className="grid gap-2">
        <input
          name="name"
          placeholder="Your name (optional)"
          className="rounded border px-3 py-2"
        />
        <input
          name="email"
          type="email"
          placeholder="Your email (optional)"
          className="rounded border px-3 py-2"
        />
        <textarea
          name="note"
          placeholder="Note (optional)"
          className="rounded border px-3 py-2"
        />
        <input
          name="files"
          type="file"
          multiple
          className="rounded border px-3 py-2"
        />
        <button type="submit" className="rounded bg-black text-white px-4 py-2">
          Send
        </button>
      </div>
    </form>
  );
}
