import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { EssayCard } from "@/components/site/EssayCard";

export const Route = createFileRoute("/essays")({
  head: () => ({
    meta: [
      { title: "Essays — Muslima" },
      { name: "description", content: "The full archive of essays published in Muslima." },
    ],
  }),
  component: EssaysIndex,
});

function EssaysIndex() {
  const { data, isLoading } = useQuery({ queryKey: ["public", "essays"], queryFn: api.publicApi.essays });
  const essays = (data ?? []).filter((e) => e.published);

  return (
    <div className="min-h-screen bg-background text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-[1240px] px-6 md:px-10 pt-16 pb-12">
        <div className="eyebrow mb-4">The Archive</div>
        <h1 className="font-serif text-5xl md:text-6xl leading-tight text-ink">Essays</h1>
        <p className="mt-4 max-w-2xl text-ink-soft">
          Every piece we have set into type, most recent first.
        </p>
      </section>

      <section className="mx-auto max-w-[1240px] px-6 md:px-10 pb-24">
        {isLoading ? (
          <div className="py-16 text-center eyebrow">Loading…</div>
        ) : essays.length === 0 ? (
          <div className="py-16 text-center text-ink-soft">
            No essays yet. <Link to="/admin" className="border-b border-ink hover:text-accent">Publish the first</Link>.
          </div>
        ) : (
          <div className="grid gap-12 md:grid-cols-3 rule-t pt-12">
            {essays.map((e) => <EssayCard key={e.id} essay={e} />)}
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
