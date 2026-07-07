import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, type Book } from "@/lib/api";
import { toast } from "sonner";
import {
  Field, TextInput, TextArea, PrimaryButton, GhostButton, DangerButton,
  PageHeader, Switch, MediaPicker, slugify,
} from "@/components/admin/ui";

export const Route = createFileRoute("/admin/books")({
  component: BooksAdmin,
});

const empty: Partial<Book> = {
  title: "", slug: "", description: "", author: "", published: true, order: 0, coverImageId: null, fileId: null,
};

function BooksAdmin() {
  const qc = useQueryClient();
  const { data: books = [], isLoading } = useQuery({ queryKey: ["admin", "books"], queryFn: api.admin.books.list });
  const [editing, setEditing] = useState<Partial<Book> | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "books"] });
    qc.invalidateQueries({ queryKey: ["public", "books"] });
  };

  const create = useMutation({ mutationFn: (d: Partial<Book>) => api.admin.books.create(d), onSuccess: () => { invalidate(); toast.success("Book saved."); setEditing(null); }, onError: (e: Error) => toast.error(e.message) });
  const update = useMutation({ mutationFn: ({ id, d }: { id: string; d: Partial<Book> }) => api.admin.books.update(id, d), onSuccess: () => { invalidate(); toast.success("Book updated."); setEditing(null); }, onError: (e: Error) => toast.error(e.message) });
  const remove = useMutation({ mutationFn: (id: string) => api.admin.books.remove(id), onSuccess: () => { invalidate(); toast.success("Book deleted."); }, onError: (e: Error) => toast.error(e.message) });

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
        kicker="Small Editions"
        title="Books"
        action={<PrimaryButton onClick={() => setEditing({ ...empty })}>New book</PrimaryButton>}
      />
      {isLoading ? <p className="text-ink-soft">Loading…</p> : books.length === 0 ? <p className="text-ink-soft">No books yet.</p> : (
        <ul className="rule-t">
          {books.map((b) => (
            <li key={b.id} className="rule-b py-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="font-serif text-lg text-ink truncate">{b.title}</div>
                <div className="mt-1 text-xs text-ink-soft flex items-center gap-3">
                  <span className="eyebrow">{b.published ? "Published" : "Draft"}</span>
                  {b.author && <span>· {b.author}</span>}
                  <span>· /{b.slug}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <GhostButton onClick={() => setEditing(b)}>Edit</GhostButton>
                <DangerButton onClick={() => { if (confirm(`Delete "${b.title}"?`)) remove.mutate(b.id); }}>Delete</DangerButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <div className="fixed inset-0 bg-ink/40 z-50 flex justify-end" onClick={() => setEditing(null)}>
          <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="bg-background w-full max-w-2xl h-full overflow-y-auto p-8 md:p-10 space-y-6">
            <div className="flex items-center justify-between rule-b pb-4">
              <h2 className="font-serif text-2xl text-ink">{editing.id ? "Edit book" : "New book"}</h2>
              <button type="button" onClick={() => setEditing(null)} className="eyebrow">Close</button>
            </div>
            <Field label="Title"><TextInput value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required /></Field>
            <Field label="Author"><TextInput value={editing.author ?? ""} onChange={(e) => setEditing({ ...editing, author: e.target.value })} /></Field>
            <Field label="Slug"><TextInput value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></Field>
            <Field label="Description (HTML)"><TextArea rows={8} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></Field>
            <MediaPicker label="Cover image" value={editing.coverImageId ?? null} onChange={(id) => setEditing({ ...editing, coverImageId: id })} />
            <MediaPicker label="Book file (PDF etc.)" accept="application/pdf,application/epub+zip,*/*" value={editing.fileId ?? null} onChange={(id) => setEditing({ ...editing, fileId: id })} />
            <div className="flex items-center gap-8 rule-t pt-6">
              <Switch checked={!!editing.published} onChange={(v) => setEditing({ ...editing, published: v })} label="Published" />
              <Field label="Order"><TextInput type="number" value={editing.order ?? 0} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} className="w-24" /></Field>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <GhostButton type="button" onClick={() => setEditing(null)}>Cancel</GhostButton>
              <PrimaryButton type="submit">Save</PrimaryButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
