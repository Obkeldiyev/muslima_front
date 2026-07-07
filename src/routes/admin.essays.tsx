import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, type Essay } from "@/lib/api";
import { toast } from "sonner";
import {
  Field, TextInput, TextArea, PrimaryButton, GhostButton, DangerButton,
  PageHeader, Switch, MediaPicker, slugify,
} from "@/components/admin/ui";
import { WordEditor } from "@/components/admin/WordEditor";

export const Route = createFileRoute("/admin/essays")({
  component: EssaysAdmin,
});

const empty: Partial<Essay> = {
  title: "", slug: "", excerpt: "", content: "",
  published: true, order: 0, topicId: null, coverImageId: null,
};

function EssaysAdmin() {
  const qc = useQueryClient();
  const { data: essays = [], isLoading } = useQuery({ queryKey: ["admin", "essays"], queryFn: api.admin.essays.list });
  const { data: topics = [] } = useQuery({ queryKey: ["admin", "topics"], queryFn: api.admin.topics.list });
  const [editing, setEditing] = useState<Partial<Essay> | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "essays"] });
    qc.invalidateQueries({ queryKey: ["public", "essays"] });
  };

  const create = useMutation({
    mutationFn: (d: Partial<Essay>) => api.admin.essays.create(d),
    onSuccess: () => { invalidate(); toast.success("Essay saved."); setEditing(null); },
    onError: (e: Error) => toast.error(e.message),
  });
  const update = useMutation({
    mutationFn: ({ id, d }: { id: string; d: Partial<Essay> }) => api.admin.essays.update(id, d),
    onSuccess: () => { invalidate(); toast.success("Essay updated."); setEditing(null); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.admin.essays.remove(id),
    onSuccess: () => { invalidate(); toast.success("Essay deleted."); },
    onError: (e: Error) => toast.error(e.message),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const payload = { ...editing };
    if (!payload.slug && payload.title) payload.slug = slugify(payload.title);
    if (editing.id) update.mutate({ id: editing.id, d: payload });
    else create.mutate(payload);
  }

  return (
    <div className="p-8 md:p-12 max-w-5xl">
      <PageHeader
        kicker="Editorial"
        title="Essays"
        action={<PrimaryButton onClick={() => setEditing({ ...empty })}>New essay</PrimaryButton>}
      />

      {isLoading ? (
        <p className="text-ink-soft">Loading…</p>
      ) : essays.length === 0 ? (
        <p className="text-ink-soft">No essays yet.</p>
      ) : (
        <ul className="rule-t">
          {essays.map((e) => (
            <li key={e.id} className="rule-b py-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="font-serif text-lg text-ink truncate">{e.title}</div>
                <div className="mt-1 text-xs text-ink-soft flex items-center gap-3">
                  <span className="eyebrow">{e.published ? "Published" : "Draft"}</span>
                  {e.topic && <span>· {e.topic.title}</span>}
                  <span>· /{e.slug}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <GhostButton onClick={() => setEditing(e)}>Edit</GhostButton>
                <DangerButton onClick={() => {
                  if (confirm(`Delete "${e.title}"?`)) remove.mutate(e.id);
                }}>Delete</DangerButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <div className="fixed inset-0 bg-ink/40 z-50 flex justify-end" onClick={() => setEditing(null)}>
          <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="bg-background w-full max-w-2xl h-full overflow-y-auto p-8 md:p-10 space-y-6">
            <div className="flex items-center justify-between rule-b pb-4">
              <h2 className="font-serif text-2xl text-ink">{editing.id ? "Edit essay" : "New essay"}</h2>
              <button type="button" onClick={() => setEditing(null)} className="eyebrow">Close</button>
            </div>
            <Field label="Title">
              <TextInput
                value={editing.title ?? ""}
                onChange={(ev) => setEditing({ ...editing, title: ev.target.value })}
                required
              />
            </Field>
            <Field label="Slug">
              <TextInput
                value={editing.slug ?? ""}
                onChange={(ev) => setEditing({ ...editing, slug: ev.target.value })}
                placeholder="auto-generated from title"
              />
            </Field>
            <Field label="Topic">
              <select
                value={editing.topicId ?? ""}
                onChange={(ev) => setEditing({ ...editing, topicId: ev.target.value || null })}
                className="w-full bg-transparent border border-input rounded-sm px-3 py-2 text-ink"
              >
                <option value="">— None —</option>
                {topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </Field>
            <Field label="Excerpt">
              <TextArea
                rows={3}
                value={editing.excerpt ?? ""}
                onChange={(ev) => setEditing({ ...editing, excerpt: ev.target.value })}
              />
            </Field>
            <Field label="Content">
              <WordEditor
                value={editing.content ?? ""}
                onChange={(value) => setEditing({ ...editing, content: value })}
                placeholder="Write your essay here…"
              />
            </Field>
            <MediaPicker
              label="Cover image"
              value={editing.coverImageId ?? null}
              onChange={(id) => setEditing({ ...editing, coverImageId: id })}
            />
            <div className="flex items-center gap-8 rule-t pt-6">
              <Switch
                checked={!!editing.published}
                onChange={(v) => setEditing({ ...editing, published: v })}
                label="Published"
              />
              <Field label="Order">
                <TextInput
                  type="number"
                  value={editing.order ?? 0}
                  onChange={(ev) => setEditing({ ...editing, order: Number(ev.target.value) })}
                  className="w-24"
                />
              </Field>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <GhostButton type="button" onClick={() => setEditing(null)}>Cancel</GhostButton>
              <PrimaryButton type="submit" disabled={create.isPending || update.isPending}>
                {create.isPending || update.isPending ? "Saving…" : "Save"}
              </PrimaryButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
