import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api, mediaUrl } from "@/lib/api";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { EssayCard } from "@/components/site/EssayCard";

export const Route = createFileRoute("/essays/$slug")({
  component: EssayDetail,
});

function EssayDetail() {
  const { slug } = Route.useParams();
  const { data: essay, isLoading, isError } = useQuery({
    queryKey: ["public", "essay", slug],
    queryFn: () => api.publicApi.essay(slug),
  });
  const { data: all } = useQuery({ queryKey: ["public", "essays"], queryFn: api.publicApi.essays });

  if (isLoading) {
    return <ShellLoading />;
  }
  if (isError || !essay) {
    throw notFound();
  }

  const related = (all ?? [])
    .filter((e) => e.published && e.id !== essay.id && (essay.topicId ? e.topicId === essay.topicId : true))
    .slice(0, 3);

  const cover = mediaUrl(essay.coverImage);

  return (
    <div className="min-h-screen bg-background text-ink">
      <SiteHeader />

      <article>
        <header className="mx-auto max-w-3xl px-6 md:px-10 pt-16 md:pt-24 pb-10 text-center">
          {essay.topic && (
            <Link
              to="/topics/$slug"
              params={{ slug: essay.topic.slug }}
              className="eyebrow hover:text-accent"
            >
              {essay.topic.title}
            </Link>
          )}
          <h1 className="mt-6 font-serif text-4xl md:text-6xl leading-[1.05] tracking-tight text-ink">
            {essay.title}
          </h1>
          {essay.excerpt && (
            <p className="mt-8 font-serif text-xl md:text-2xl leading-relaxed text-ink-soft">
              {essay.excerpt}
            </p>
          )}
          <div className="mt-10 eyebrow">
            {new Date(essay.createdAt).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </div>
        </header>

        {cover && (
          <div className="mx-auto max-w-5xl px-6 md:px-10 mb-12">
            <div className="aspect-[16/9] overflow-hidden bg-muted">
              <img src={cover} alt={essay.title} className="h-full w-full object-cover" />
            </div>
          </div>
        )}

        <div className="mx-auto max-w-2xl px-6 md:px-10 pb-20">
          <div className="prose-editorial rounded-none border border-rule/70 bg-card/70 p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
            <div dangerouslySetInnerHTML={{ __html: essay.content ?? "<p><em>No content yet.</em></p>" }} />
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="rule-t bg-secondary/40">
          <div className="mx-auto max-w-[1240px] px-6 md:px-10 py-20">
            <div className="eyebrow mb-2">Continue reading</div>
            <h2 className="font-serif text-3xl text-ink">Related essays</h2>
            <div className="mt-10 grid gap-10 md:grid-cols-3">
              {related.map((e) => <EssayCard key={e.id} essay={e} />)}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}

function ShellLoading() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="py-32 text-center eyebrow">Loading…</div>
    </div>
  );
}
