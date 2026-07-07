import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, mediaUrl } from "@/lib/api";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/media")({
  component: MediaAdmin,
});

function MediaAdmin() {
  const qc = useQueryClient();
  const { data: media = [], isLoading } = useQuery({ queryKey: ["admin", "media"], queryFn: api.admin.media.list });
  const [uploading, setUploading] = useState(false);

  const upload = useMutation({
    mutationFn: (file: File) => api.admin.media.upload(file),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "media"] }); toast.success("Uploaded."); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-8 md:p-12 max-w-6xl">
      <PageHeader
        kicker="Library"
        title="Media"
        action={
          <label className="cursor-pointer bg-ink text-paper px-5 py-2.5 text-xs tracking-[0.14em] uppercase hover:bg-accent transition-colors">
            {uploading ? "Uploading…" : "Upload"}
            <input
              type="file"
              className="hidden"
              onChange={async (e) => {
                const files = Array.from(e.target.files ?? []);
                setUploading(true);
                for (const f of files) {
                  try { await upload.mutateAsync(f); } catch { /* toast handled */ }
                }
                setUploading(false);
                e.target.value = "";
              }}
              multiple
            />
          </label>
        }
      />
      {isLoading ? <p className="text-ink-soft">Loading…</p> : media.length === 0 ? (
        <p className="text-ink-soft">No files yet. Upload images, PDFs, or documents to reuse across content.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {media.map((m) => {
            const url = mediaUrl(m);
            const isImg = m.kind === "IMAGE" || (m.mimeType && m.mimeType.startsWith("image/"));
            return (
              <div key={m.id} className="group">
                <div className="aspect-square bg-muted overflow-hidden">
                  {isImg && url ? (
                    <img src={url} alt={m.originalName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-ink-soft uppercase tracking-widest">
                      {m.mimeType?.split("/")[1] ?? "file"}
                    </div>
                  )}
                </div>
                <div className="mt-2 text-xs text-ink-soft truncate" title={m.originalName}>{m.originalName}</div>
                {url && (
                  <a href={url} target="_blank" rel="noreferrer" className="text-[0.68rem] tracking-widest uppercase text-ink-soft hover:text-ink">
                    Open →
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
