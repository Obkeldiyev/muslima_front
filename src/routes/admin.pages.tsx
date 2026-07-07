import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, type Page, type PageSection } from "@/lib/api";
import { toast } from "sonner";
import {
  Field, TextInput, TextArea, PrimaryButton, GhostButton, DangerButton,
  PageHeader, Switch, MediaPicker, slugify,
} from "@/components/admin/ui";

export const Route = createFileRoute("/admin/pages")({
  component: PagesAdmin,
});

const SECTION_TYPES = [
  { value: "hero", label: "Hero" },
  { value: "text", label: "Text block" },
  { value: "image", label: "Image" },
  { value: "media", label: "Media / embed" },
  { value: "essay", label: "Linked essay" },
  { value: "topic", label: "Linked topic" },
  { value: "book", label: "Linked book" },
] as const;

function PagesAdmin() {
  const qc = useQueryClient();
  const [slugInput, setSlugInput] = useState("home");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const pageQ = useQuery({
    queryKey: ["admin", "page", activeSlug],
    queryFn: () => api.admin.pages.get(activeSlug!),
    enabled: !!activeSlug,
    retry: false,
  });

  const createPage = useMutation({
    mutationFn: (d: Partial<Page>) => api.admin.pages.create(d),
    onSuccess: (p) => { toast.success("Page created."); setActiveSlug(p.slug); setCreating(false); qc.invalidateQueries({ queryKey: ["admin", "page"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-8 md:p-12 max-w-5xl">
      <PageHeader kicker="Builder" title="Pages" />

      <div className="flex flex-wrap items-end gap-3 mb-8">
        <Field label="Load page by slug">
          <TextInput value={slugInput} onChange={(e) => setSlugInput(e.target.value)} placeholder="home" />
        </Field>
        <PrimaryButton onClick={() => setActiveSlug(slugInput.trim())}>Open</PrimaryButton>
        <GhostButton onClick={() => setCreating(true)}>New page</GhostButton>
      </div>

      {creating && (
        <PageCreateForm
          onCancel={() => setCreating(false)}
          onSubmit={(d) => createPage.mutate(d)}
        />
      )}

      {activeSlug && (
        <>
          {pageQ.isLoading && <p className="text-ink-soft">Loading page…</p>}
          {pageQ.isError && (
            <div className="rule-t rule-b py-6 my-4 text-center text-ink-soft">
              No page found at <code>/{activeSlug}</code>.{" "}
              <button className="border-b border-ink hover:text-accent" onClick={() => setCreating(true)}>Create it</button>.
            </div>
          )}
          {pageQ.data && <PageEditor page={pageQ.data} />}
        </>
      )}
    </div>
  );
}

function PageCreateForm({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (d: Partial<Page>) => void }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  return (
    <form
      className="rule-t rule-b py-6 my-4 space-y-4"
      onSubmit={(e) => { e.preventDefault(); onSubmit({ title, slug: slug || slugify(title), description, published: true }); }}
    >
      <Field label="Title"><TextInput value={title} onChange={(e) => setTitle(e.target.value)} required /></Field>
      <Field label="Slug"><TextInput value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto" /></Field>
      <Field label="Description"><TextArea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
      <div className="flex gap-3 justify-end">
        <GhostButton type="button" onClick={onCancel}>Cancel</GhostButton>
        <PrimaryButton type="submit">Create page</PrimaryButton>
      </div>
    </form>
  );
}

function PageEditor({ page }: { page: Page }) {
  const qc = useQueryClient();
  const [meta, setMeta] = useState({ title: page.title, description: page.description ?? "", published: page.published });

  const savePage = useMutation({
    mutationFn: () => api.admin.pages.update(page.id, meta),
    onSuccess: () => { toast.success("Page saved."); qc.invalidateQueries({ queryKey: ["admin", "page", page.slug] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const addSection = useMutation({
    mutationFn: (type: string) =>
      api.admin.pages.createSection({
        pageId: page.id,
        type,
        title: null,
        content: null,
        order: page.sections.length,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "page", page.slug] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <div className="rule-t rule-b py-6 space-y-4">
        <div className="flex items-center justify-between gap-6">
          <div>
            <div className="eyebrow">Editing page</div>
            <div className="font-serif text-2xl text-ink">/{page.slug}</div>
          </div>
          <div className="flex items-center gap-6">
            <Switch checked={meta.published} onChange={(v) => setMeta({ ...meta, published: v })} label="Published" />
            <PrimaryButton onClick={() => savePage.mutate()}>Save page</PrimaryButton>
          </div>
        </div>
        <Field label="Title"><TextInput value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} /></Field>
        <Field label="Description"><TextArea rows={2} value={meta.description} onChange={(e) => setMeta({ ...meta, description: e.target.value })} /></Field>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl text-ink">Sections</h2>
          <div className="flex flex-wrap gap-2">
            {SECTION_TYPES.map((t) => (
              <GhostButton key={t.value} onClick={() => addSection.mutate(t.value)}>+ {t.label}</GhostButton>
            ))}
          </div>
        </div>
        {page.sections.length === 0 ? (
          <p className="text-ink-soft py-8 text-center rule-t rule-b">No sections yet. Add a block above to begin composing the page.</p>
        ) : (
          <ul className="space-y-4">
            {[...page.sections].sort((a, b) => a.order - b.order).map((s) => (
              <SectionEditor key={s.id} section={s} pageSlug={page.slug} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SectionEditor({ section, pageSlug }: { section: PageSection; pageSlug: string }) {
  const qc = useQueryClient();
  const [local, setLocal] = useState<PageSection>(section);
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "page", pageSlug] });

  const save = useMutation({
    mutationFn: () => api.admin.pages.updateSection(section.id, {
      title: local.title, content: local.content, order: local.order,
      imageId: local.imageId, topicId: local.topicId, essayId: local.essayId, bookId: local.bookId,
      metadata: local.metadata,
    }),
    onSuccess: () => { invalidate(); toast.success("Section saved."); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: () => api.admin.pages.removeSection(section.id),
    onSuccess: () => { invalidate(); toast.success("Section removed."); },
    onError: (e: Error) => toast.error(e.message),
  });
  const { data: topics = [] } = useQuery({ queryKey: ["admin", "topics"], queryFn: api.admin.topics.list, enabled: local.type === "topic" });
  const { data: essays = [] } = useQuery({ queryKey: ["admin", "essays"], queryFn: api.admin.essays.list, enabled: local.type === "essay" });
  const { data: books = [] } = useQuery({ queryKey: ["admin", "books"], queryFn: api.admin.books.list, enabled: local.type === "book" });
  const metadata = (local.metadata as Record<string, unknown> | null) ?? {};
  const backgroundType = String(metadata.backgroundType ?? "none");
  const backgroundColor = String(metadata.backgroundColor ?? "#f5efe7");
  const updateMetadata = (next: Record<string, unknown>) => {
    setLocal({ ...local, metadata: { ...metadata, ...next } });
  };

  return (
    <li className="border border-rule bg-card p-6 space-y-4">
      <div className="flex items-center justify-between rule-b pb-3">
        <div className="flex items-center gap-4">
          <span className="eyebrow">{section.type}</span>
          <TextInput
            type="number"
            value={local.order}
            onChange={(e) => setLocal({ ...local, order: Number(e.target.value) })}
            className="w-16"
          />
        </div>
        <div className="flex items-center gap-4">
          <GhostButton onClick={() => save.mutate()}>Save</GhostButton>
          <DangerButton onClick={() => { if (confirm("Remove section?")) remove.mutate(); }}>Delete</DangerButton>
        </div>
      </div>

      {(local.type === "hero" || local.type === "text" || local.type === "image" || local.type === "media") && (
        <>
          <Field label="Title"><TextInput value={local.title ?? ""} onChange={(e) => setLocal({ ...local, title: e.target.value })} /></Field>
          <Field label="Content (HTML or embed code)">
            <TextArea rows={local.type === "text" ? 8 : 3} value={local.content ?? ""} onChange={(e) => setLocal({ ...local, content: e.target.value })} />
          </Field>
        </>
      )}

      {(local.type === "hero" || local.type === "image" || local.type === "media") && (
        <>
          <MediaPicker
            label="Image / media"
            value={local.imageId ?? null}
            onChange={(id) => setLocal({ ...local, imageId: id })}
          />
          <Field label="Background type">
            <select
              className="w-full bg-transparent border border-input rounded-sm px-3 py-2"
              value={backgroundType}
              onChange={(e) => updateMetadata({ backgroundType: e.target.value })}
            >
              <option value="none">None</option>
              <option value="color">Color</option>
              <option value="image">Image</option>
            </select>
          </Field>
          {backgroundType === "color" && (
            <Field label="Background color">
              <TextInput value={backgroundColor} onChange={(e) => updateMetadata({ backgroundColor: e.target.value })} placeholder="#f5efe7" />
            </Field>
          )}
          {backgroundType === "image" && (
            <MediaPicker
              label="Background image"
              value={local.imageId ?? null}
              onChange={(id) => setLocal({ ...local, imageId: id })}
            />
          )}
        </>
      )}

      {local.type === "essay" && (
        <Field label="Linked essay">
          <select className="w-full bg-transparent border border-input rounded-sm px-3 py-2" value={local.essayId ?? ""} onChange={(e) => setLocal({ ...local, essayId: e.target.value || null })}>
            <option value="">— Choose —</option>
            {essays.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </Field>
      )}
      {local.type === "topic" && (
        <Field label="Linked topic">
          <select className="w-full bg-transparent border border-input rounded-sm px-3 py-2" value={local.topicId ?? ""} onChange={(e) => setLocal({ ...local, topicId: e.target.value || null })}>
            <option value="">— Choose —</option>
            {topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </Field>
      )}
      {local.type === "book" && (
        <Field label="Linked book">
          <select className="w-full bg-transparent border border-input rounded-sm px-3 py-2" value={local.bookId ?? ""} onChange={(e) => setLocal({ ...local, bookId: e.target.value || null })}>
            <option value="">— Choose —</option>
            {books.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
          </select>
        </Field>
      )}
    </li>
  );
}
