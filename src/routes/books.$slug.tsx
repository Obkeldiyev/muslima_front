import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api, mediaUrl } from "@/lib/api";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";

export const Route = createFileRoute("/books/$slug")({
  component: BookDetail,
});

function BookDetail() {
  const { slug } = Route.useParams();
  const { data: all, isLoading } = useQuery({ queryKey: ["public", "books"], queryFn: api.publicApi.books });
  const book = (all ?? []).find((b) => b.slug === slug);
  if (isLoading) return <div className="min-h-screen bg-background"><SiteHeader /><div className="py-32 text-center eyebrow">Loading…</div></div>;
  if (!book) throw notFound();

  const cover = mediaUrl(book.coverImage);
  const file = mediaUrl(book.file);
  const fileName = book.file?.originalName ?? book.file?.filename ?? "Book file";
  const isPdf = (book.file?.mimeType || "").toLowerCase().includes("pdf") || fileName.toLowerCase().endsWith(".pdf");
  const isBrowserViewable = isPdf || (book.file?.mimeType || "").toLowerCase().includes("text") || fileName.toLowerCase().endsWith(".txt");

  return (
    <div className="min-h-screen bg-background text-ink">
      <SiteHeader />
      <article className="mx-auto max-w-[1240px] px-6 md:px-10 py-16 md:py-24">
        <div className="grid md:grid-cols-[minmax(280px,400px)_1fr] gap-12 md:gap-20 items-start">
          <div className="aspect-[3/4] bg-muted overflow-hidden shadow-md">
            {cover ? (
              <img src={cover} alt={book.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-ink/10 to-ink/5 flex items-center justify-center p-8">
                <span className="font-serif text-3xl text-ink text-center leading-tight">{book.title}</span>
              </div>
            )}
          </div>
          <div>
            <div className="eyebrow mb-4">A Muslima Edition</div>
            <h1 className="font-serif text-4xl md:text-6xl leading-[1.05] tracking-tight text-ink">{book.title}</h1>
            {book.author && (
              <p className="mt-4 font-serif text-xl italic text-ink-soft">by {book.author}</p>
            )}
            {book.description && (
              <div className="mt-8 prose-editorial max-w-none" dangerouslySetInnerHTML={{ __html: book.description }} />
            )}
            {file && (
              <div className="mt-10 rule-t pt-6 space-y-4">
                {isBrowserViewable ? (
                  <div className="overflow-hidden rounded-[1.2rem] border border-rule/80 bg-card">
                    <div className="border-b border-rule/70 px-4 py-3 text-sm text-ink-soft">
                      Preview • {fileName}
                    </div>
                    <iframe src={file} title={`${book.title} preview`} className="h-[70vh] w-full bg-paper" />
                  </div>
                ) : null}
                <div className="flex flex-wrap items-center gap-4">
                  <a href={file} target="_blank" rel="noreferrer" download className="inline-flex items-center gap-3 eyebrow border-b border-ink pb-1 hover:text-accent">
                    Open in a new tab →
                  </a>
                  <a href={file} download className="text-sm text-ink-soft hover:text-ink">
                    Download file
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
      <SiteFooter />
    </div>
  );
}
