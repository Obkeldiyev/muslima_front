import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api, mediaUrl } from "@/lib/api";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { EssayCard } from "@/components/site/EssayCard";

export const Route = createFileRoute("/topics/$slug")({
  component: TopicDetail,
});

function TopicDetail() {
  const { slug } = Route.useParams();
  const { data: topic, isLoading, isError } = useQuery({
    queryKey: ["public", "topic", slug],
    queryFn: () => api.publicApi.topic(slug),
  });
  if (isLoading) return <div className="min-h-screen bg-background"><SiteHeader /><div className="py-32 text-center eyebrow">Loading…</div></div>;
  if (isError || !topic) throw notFound();

  const cover = mediaUrl(topic.featuredImage);
  const essays = topic.essays ?? [];

  return (
    <div className="min-h-screen bg-background text-ink">
      <SiteHeader />
      <section className="rule-b">
        <div className="mx-auto max-w-[1240px] px-6 md:px-10 pt-16 pb-16 grid md:grid-cols-[1fr_1fr] gap-12 items-end">
          <div>
            <div className="eyebrow mb-4">A Department of Muslima</div>
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.02] tracking-tight text-ink">{topic.title}</h1>
            {topic.description && (
              <p className="mt-6 font-serif text-xl leading-relaxed text-ink-soft max-w-xl">{topic.description}</p>
            )}
          </div>
          {cover && (
            <div className="aspect-[4/3] bg-muted overflow-hidden">
              <img src={cover} alt={topic.title} className="h-full w-full object-cover" />
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-6 md:px-10 py-16 md:py-24">
        <div className="eyebrow mb-2">Collected essays</div>
        <h2 className="font-serif text-3xl text-ink">In this department</h2>
        {essays.length === 0 ? (
          <p className="mt-8 text-ink-soft">No essays gathered under this topic yet.</p>
        ) : (
          <div className="mt-12 grid gap-12 md:grid-cols-3">
            {essays.filter((e) => e.published).map((e) => <EssayCard key={e.id} essay={{ ...e, topic }} />)}
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
