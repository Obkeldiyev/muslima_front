import { useState, type ReactNode } from "react";
import { api, mediaUrl, type MediaAsset } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "w-full bg-transparent border border-input rounded-sm px-3 py-2 text-ink focus:border-ink focus:outline-none " +
        (props.className ?? "")
      }
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={
        "w-full bg-transparent border border-input rounded-sm px-3 py-2 text-ink focus:border-ink focus:outline-none font-serif leading-relaxed " +
        (props.className ?? "")
      }
    />
  );
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        "bg-ink text-paper px-5 py-2.5 text-xs tracking-[0.14em] uppercase hover:bg-accent transition-colors disabled:opacity-50 " +
        (props.className ?? "")
      }
    />
  );
}

export function GhostButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        "border border-ink/40 text-ink px-4 py-2 text-xs tracking-[0.14em] uppercase hover:border-ink transition-colors " +
        (props.className ?? "")
      }
    />
  );
}

export function DangerButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        "text-destructive text-xs tracking-[0.14em] uppercase hover:underline " +
        (props.className ?? "")
      }
    />
  );
}

export function PageHeader({ title, kicker, action }: { title: string; kicker: string; action?: ReactNode }) {
  return (
    <div className="rule-b pb-6 mb-8 flex items-end justify-between gap-6">
      <div>
        <div className="eyebrow mb-2">{kicker}</div>
        <h1 className="font-serif text-4xl text-ink">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer">
      <span className="eyebrow">{label}</span>
      <span
        onClick={() => onChange(!checked)}
        className={
          "relative inline-block w-10 h-5 rounded-full transition-colors " +
          (checked ? "bg-ink" : "bg-input")
        }
      >
        <span
          className={
            "absolute top-0.5 h-4 w-4 rounded-full bg-paper transition-transform " +
            (checked ? "translate-x-5" : "translate-x-0.5")
          }
        />
      </span>
    </label>
  );
}

export function MediaPicker({
  value,
  onChange,
  accept = "image/*",
  label = "Image",
}: {
  value: string | null;
  onChange: (id: string | null, asset: MediaAsset | null) => void;
  accept?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const { data: media = [] } = useQuery({ queryKey: ["admin", "media"], queryFn: api.admin.media.list });
  const selected = media.find((m) => m.id === value) ?? null;

  const upload = useMutation({
    mutationFn: (file: File) => api.admin.media.upload(file),
    onSuccess: (asset) => {
      qc.invalidateQueries({ queryKey: ["admin", "media"] });
      onChange(asset.id, asset);
      toast.success("Uploaded.");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <div className="eyebrow mb-2">{label}</div>
      {selected ? (
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 bg-muted overflow-hidden shrink-0">
            {mediaUrl(selected) && <img src={mediaUrl(selected)!} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="text-sm">
            <div className="text-ink">{selected.originalName}</div>
            <button type="button" onClick={() => onChange(null, null)} className="mt-2 text-destructive text-xs uppercase tracking-widest">Remove</button>
            <button type="button" onClick={() => setOpen(true)} className="ml-4 text-xs uppercase tracking-widest text-ink-soft hover:text-ink">Change</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <label className="inline-block cursor-pointer border border-dashed border-ink/40 hover:border-ink px-4 py-3 text-xs tracking-[0.14em] uppercase text-ink-soft hover:text-ink">
            Upload file
            <input
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload.mutate(f);
              }}
            />
          </label>
          <button type="button" onClick={() => setOpen(true)} className="text-xs tracking-[0.14em] uppercase text-ink-soft hover:text-ink">
            or pick existing
          </button>
        </div>
      )}
      {open && (
        <div className="fixed inset-0 bg-ink/40 z-50 flex items-center justify-center p-6" onClick={() => setOpen(false)}>
          <div className="bg-background max-w-3xl w-full max-h-[80vh] overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-2xl text-ink">Media library</h3>
              <button onClick={() => setOpen(false)} className="eyebrow">Close</button>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {media.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => { onChange(m.id, m); setOpen(false); }}
                  className="aspect-square bg-muted overflow-hidden hover:ring-2 ring-ink"
                >
                  {mediaUrl(m) ? (
                    <img src={mediaUrl(m)!} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="p-2 text-xs text-ink-soft">{m.originalName}</div>
                  )}
                </button>
              ))}
              {media.length === 0 && <p className="text-ink-soft">No media yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
