import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api, mediaUrl } from "@/lib/api";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";

export const Route = createFileRoute("/topics")({
  head: () => ({
    meta: [
      { title: "Topics — Muslima" },
      { name: "description", content: "Curated departments of writing gathered around a single subject." },
    ],
  }),
  component: TopicsIndex,
});

function TopicsIndex() {
  const { data, isLoading } = useQuery({ queryKey: ["public", "topics"], queryFn: api.publicApi.topics });
  const topics = (data ?? []).filter((t) => t.published);

  return (
    <div className="min-h-screen bg-background text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-[1240px] px-6 md:px-10 pt-16 pb-12">
        <div className="eyebrow mb-4">Departments</div>
        <h1 className="font-serif text-5xl md:text-6xl leading-tight text-ink">Topics</h1>
        <p className="mt-4 max-w-2xl text-ink-soft">
          Long-standing subjects the magazine returns to.
        </p>
      </section>

      <section className="mx-auto max-w-[1240px] px-6 md:px-10 pb-24">
        {isLoading ? (
          <div className="py-16 text-center eyebrow">Loading…</div>
        ) : topics.length === 0 ? (
          <div className="py-16 text-center text-ink-soft">No topics yet.</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {topics.map((t, i) => {
              const image = mediaUrl(t.featuredImage);
              return (
                <Link
                  key={t.id}
                  to="/topics/$slug"
                  params={{ slug: t.slug }}
                  className="group overflow-hidden rounded-[1.6rem] border border-rule/80 bg-card shadow-[0_18px_56px_-34px_rgba(0,0,0,0.28)] transition-all hover:-translate-y-1"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    {image ? (
                      <img src={image} alt={t.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                    ) : (
                      <div className="flex h-full w-full items-end bg-gradient-to-br from-secondary via-background to-muted p-6">
                        <span className="rounded-full border border-ink/10 bg-background/80 px-3 py-1 text-xs uppercase tracking-[0.24em] text-ink-soft">
                          Department
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-5 md:p-6">
                      <div className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-white/90">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <h3 className="font-serif text-2xl leading-tight text-white md:text-3xl">
                        {t.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-5 md:p-6">
                    {t.description && <p className="text-sm leading-relaxed text-ink-soft">{t.description}</p>}
                    <div className="mt-5 eyebrow">Read the department →</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
