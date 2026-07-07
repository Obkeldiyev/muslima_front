import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api, mediaUrl } from "@/lib/api";
import { useSiteSettings } from "@/lib/site-settings";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { EssayCard } from "@/components/site/EssayCard";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const settings = useSiteSettings();
  const home = settings.text.home;
  const essaysQ = useQuery({ queryKey: ["public", "essays"], queryFn: api.publicApi.essays });
  const topicsQ = useQuery({ queryKey: ["public", "topics"], queryFn: api.publicApi.topics });
  const booksQ = useQuery({ queryKey: ["public", "books"], queryFn: api.publicApi.books });

  const essays = (essaysQ.data ?? []).filter((e) => e.published);
  const topics = (topicsQ.data ?? []).filter((t) => t.published);
  const books = (booksQ.data ?? []).filter((b) => b.published);

  const feature = essays[0];
  const secondary = essays.slice(1, 4);
  const rest = essays.slice(4, 10);

  const anyLoading = essaysQ.isLoading && topicsQ.isLoading && booksQ.isLoading;
  const hasError = essaysQ.isError && topicsQ.isError && booksQ.isError;

  return (
    <div className="min-h-screen bg-background text-ink">
      <SiteHeader />

      {/* Masthead */}
      <section className="mx-auto max-w-[1240px] px-6 md:px-10 pt-16 md:pt-24 pb-10 md:pb-16">
        <div className="max-w-5xl">
          <div className="eyebrow mb-6">{home.mastheadKicker}</div>
          <h1 className="font-serif text-5xl md:text-7xl leading-[1.02] tracking-tight text-ink">
            {home.mastheadTitle}
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-soft leading-relaxed">
            {home.mastheadDescription}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-ink-soft">
            {home.mastheadPills.map((pill) => (
              <span key={pill} className="rounded-full border border-rule/80 px-3 py-1">{pill}</span>
            ))}
          </div>
        </div>
      </section>

      {hasError && (
        <div className="mx-auto max-w-[1240px] px-6 md:px-10">
          <BackendUnavailable />
        </div>
      )}

      {anyLoading ? (
        <div className="mx-auto max-w-[1240px] px-6 md:px-10 py-24 text-center eyebrow">Setting the type…</div>
      ) : (
        <>
          {/* Featured */}
          {feature && (
            <section className="mx-auto max-w-[1240px] px-6 md:px-10 pb-20 md:pb-24">
              <SectionHeading kicker={home.featuredKicker} title={home.featuredTitle} />
              <div className="mt-10">
                <EssayCard essay={feature} variant="feature" />
              </div>
            </section>
          )}

          {/* Recent grid */}
          {secondary.length > 0 && (
            <section className="rule-t rule-b bg-secondary/40">
              <div className="mx-auto max-w-[1240px] px-6 md:px-10 py-20">
                <SectionHeading kicker={home.recentKicker} title={home.recentTitle} />
                <div className="mt-12 grid gap-8 md:grid-cols-3">
                  {secondary.map((e) => <EssayCard key={e.id} essay={e} />)}
                </div>
              </div>
            </section>
          )}

          {/* Topics */}
          {topics.length > 0 && (
            <section className="mx-auto max-w-[1240px] px-6 md:px-10 py-20 md:py-28">
              <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-12">
                <div className="max-w-xl">
                  <div className="eyebrow mb-4">{home.topicsKicker}</div>
                  <h2 className="font-serif text-4xl md:text-5xl leading-tight text-ink">
                    {home.topicsTitle}
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-ink-soft">
                    A field guide to the recurring subjects, moods, and questions that shape the magazine.
                  </p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {topics.slice(0, 4).map((t, index) => {
                    const image = mediaUrl(t.featuredImage);
                    return (
                      <Link
                        key={t.id}
                        to="/topics/$slug"
                        params={{ slug: t.slug }}
                        className={`group overflow-hidden rounded-[1.6rem] border border-rule/80 bg-card shadow-[0_20px_60px_-34px_rgba(0,0,0,0.28)] transition-all hover:-translate-y-1 ${index === 0 ? "lg:col-span-2" : ""}`}
                      >
                        <div className={`relative ${index === 0 ? "aspect-[16/9]" : "aspect-[4/5]"} overflow-hidden bg-muted`}>
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
                              {t.slug}
                            </div>
                            <h3 className="max-w-xl font-serif text-2xl leading-tight text-white md:text-3xl">
                              {t.title}
                            </h3>
                          </div>
                        </div>
                        <div className="p-5 md:p-6">
                          {t.description && (
                            <p className="text-sm leading-relaxed text-ink-soft line-clamp-3">
                              {t.description}
                            </p>
                          )}
                          <div className="mt-5 eyebrow">Open department →</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Books */}
          {books.length > 0 && (
            <section className="rule-t bg-secondary/30">
              <div className="mx-auto max-w-[1240px] px-6 md:px-10 py-20 md:py-28">
                <SectionHeading kicker={home.booksKicker} title={home.booksTitle} />
                <div className="mt-12 grid gap-8 md:grid-cols-4">
                  {books.slice(0, 4).map((b) => (
                    <Link key={b.id} to="/books/$slug" params={{ slug: b.slug }} className="group overflow-hidden rounded-[1.35rem] border border-rule/70 bg-card p-3 shadow-[0_16px_44px_-28px_rgba(0,0,0,0.24)] transition-all hover:-translate-y-1">
                      <div className="aspect-[3/4] bg-muted overflow-hidden rounded-[1rem] mb-4">
                        {mediaUrl(b.coverImage) ? (
                          <img src={mediaUrl(b.coverImage)!} alt={b.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-ink/10 to-ink/5 flex items-center justify-center p-6">
                            <span className="font-serif text-xl text-ink text-center leading-tight">{b.title}</span>
                          </div>
                        )}
                      </div>
                      {b.author && <div className="eyebrow mb-1">{b.author}</div>}
                      <h3 className="font-serif text-xl text-ink transition-colors group-hover:text-accent">{b.title}</h3>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Rest of essays */}
          {rest.length > 0 && (
            <section className="mx-auto max-w-[1240px] px-6 md:px-10 py-20 md:py-28">
              <SectionHeading kicker={home.moreKicker} title={home.moreTitle} />
              <div className="mt-8 grid gap-x-16 md:grid-cols-2">
                {rest.map((e) => <EssayCard key={e.id} essay={e} variant="compact" />)}
              </div>
              <div className="mt-12 text-center">
                <Link to="/essays" className="eyebrow border-b border-ink pb-1 hover:text-accent">
                  {home.seeAllLabel}
                </Link>
              </div>
            </section>
          )}

          {essays.length === 0 && topics.length === 0 && books.length === 0 && !hasError && (
            <div className="mx-auto max-w-[1240px] px-6 md:px-10 py-24 text-center">
              <div className="eyebrow mb-4">Awaiting the first issue</div>
              <p className="text-ink-soft">
                No content has been published yet.{" "}
                <Link to="/admin" className="border-b border-ink hover:text-accent">Enter the studio</Link>{" "}
                to begin.
              </p>
            </div>
          )}
        </>
      )}

      <SiteFooter />
    </div>
  );
}

function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="rule-t pt-6">
      <div className="flex items-baseline justify-between gap-6">
        <div>
          <div className="eyebrow mb-2">{kicker}</div>
          <h2 className="font-serif text-3xl md:text-4xl text-ink">{title}</h2>
        </div>
      </div>
    </div>
  );
}

function BackendUnavailable() {
  return (
    <div className="rule-t rule-b py-8 my-8 text-center">
      <div className="eyebrow mb-2">A note from the pressroom</div>
      <p className="text-ink-soft max-w-xl mx-auto text-sm">
        The editorial backend could not be reached. If you are running it locally, start the API on port{" "}
        <code className="font-mono">3010</code> and make sure the proxy exposes <code className="font-mono">/api</code>, then refresh.
      </p>
    </div>
  );
}
