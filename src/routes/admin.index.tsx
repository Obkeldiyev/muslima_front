import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const Route = createFileRoute("/admin/")({
  component: AdminIndex,
});

function AdminIndex() {
  const essays = useQuery({ queryKey: ["admin", "essays"], queryFn: api.admin.essays.list });
  const topics = useQuery({ queryKey: ["admin", "topics"], queryFn: api.admin.topics.list });
  const books = useQuery({ queryKey: ["admin", "books"], queryFn: api.admin.books.list });
  const media = useQuery({ queryKey: ["admin", "media"], queryFn: api.admin.media.list });

  const cards = [
    { label: "Essays", count: essays.data?.length ?? 0, to: "/admin/essays" as const },
    { label: "Topics", count: topics.data?.length ?? 0, to: "/admin/topics" as const },
    { label: "Books", count: books.data?.length ?? 0, to: "/admin/books" as const },
    { label: "Media", count: media.data?.length ?? 0, to: "/admin/media" as const },
  ];

  const recentEssays = (essays.data ?? []).slice(0, 5);

  return (
    <div className="p-8 md:p-12 max-w-5xl">
      <div className="eyebrow mb-3">The Studio</div>
      <h1 className="font-serif text-4xl md:text-5xl text-ink">Overview</h1>
      <p className="mt-3 text-ink-soft">A calm workspace for the next issue.</p>

      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="rule-t rule-b py-6 px-4 hover:bg-secondary/40 transition-colors">
            <div className="eyebrow">{c.label}</div>
            <div className="mt-2 font-serif text-4xl text-ink tabular-nums">{c.count}</div>
          </Link>
        ))}
      </div>

      <div className="mt-16">
        <div className="eyebrow mb-3">Recently edited</div>
        <h2 className="font-serif text-2xl text-ink mb-6">Latest essays</h2>
        {essays.isLoading ? (
          <p className="text-ink-soft">Loading…</p>
        ) : recentEssays.length === 0 ? (
          <p className="text-ink-soft">
            No essays yet. <Link to="/admin/essays" className="border-b border-ink hover:text-accent">Write the first</Link>.
          </p>
        ) : (
          <ul className="rule-t">
            {recentEssays.map((e) => (
              <li key={e.id} className="rule-b py-4 flex items-center justify-between gap-6">
                <div>
                  <div className="font-serif text-lg text-ink">{e.title}</div>
                  <div className="eyebrow mt-1">{e.published ? "Published" : "Draft"}</div>
                </div>
                <Link to="/admin/essays" className="eyebrow hover:text-accent">Edit →</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
