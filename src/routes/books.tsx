import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api, mediaUrl } from "@/lib/api";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";

export const Route = createFileRoute("/books")({
  head: () => ({
    meta: [
      { title: "Books — Muslima" },
      { name: "description", content: "Small editions of books published by Muslima." },
    ],
  }),
  component: BooksIndex,
});

function BooksIndex() {
  const { data, isLoading } = useQuery({ queryKey: ["public", "books"], queryFn: api.publicApi.books });
  const books = (data ?? []).filter((b) => b.published);

  return (
    <div className="min-h-screen bg-background text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-[1240px] px-6 md:px-10 pt-16 pb-12">
        <div className="eyebrow mb-4">Small Editions</div>
        <h1 className="font-serif text-5xl md:text-6xl leading-tight text-ink">Books</h1>
        <p className="mt-4 max-w-2xl text-ink-soft">
          Volumes we've set aside for longer reading.
        </p>
      </section>

      <section className="mx-auto max-w-[1240px] px-6 md:px-10 pb-24">
        {isLoading ? (
          <div className="py-16 text-center eyebrow">Loading…</div>
        ) : books.length === 0 ? (
          <div className="py-16 text-center text-ink-soft">No books yet.</div>
        ) : (
          <div className="grid gap-x-10 gap-y-14 md:grid-cols-3 rule-t pt-12">
            {books.map((b) => {
              const img = mediaUrl(b.coverImage);
              return (
                <Link key={b.id} to="/books/$slug" params={{ slug: b.slug }} className="group">
                  <div className="aspect-[3/4] bg-muted overflow-hidden mb-5 shadow-sm">
                    {img ? (
                      <img src={img} alt={b.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-ink/10 to-ink/5 flex items-center justify-center p-8">
                        <span className="font-serif text-2xl text-ink text-center leading-tight">{b.title}</span>
                      </div>
                    )}
                  </div>
                  {b.author && <div className="eyebrow mb-1">{b.author}</div>}
                  <h3 className="font-serif text-2xl text-ink group-hover:text-accent transition-colors leading-tight">{b.title}</h3>
                  {b.description && <p className="mt-2 text-sm text-ink-soft line-clamp-2">{b.description}</p>}
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
