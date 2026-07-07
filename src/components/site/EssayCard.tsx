import { Link } from "@tanstack/react-router";
import { mediaUrl, type Essay } from "@/lib/api";

export function EssayCard({ essay, variant = "default" }: { essay: Essay; variant?: "default" | "compact" | "feature" }) {
  const img = mediaUrl(essay.coverImage);
  if (variant === "feature") {
    return (
      <Link
        to="/essays/$slug"
        params={{ slug: essay.slug }}
        className="group grid gap-8 rounded-[1.75rem] border border-rule/80 bg-card p-4 shadow-[0_24px_80px_-36px_rgba(0,0,0,0.3)] md:grid-cols-[1.15fr_0.85fr] md:gap-10 md:p-6"
      >
        <div className="aspect-[4/3] overflow-hidden rounded-[1.2rem] bg-muted">
          {img ? (
            <img src={img} alt={essay.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />
          )}
        </div>
        <div className="flex flex-col justify-center">
          {essay.topic && <div className="eyebrow mb-4">{essay.topic.title}</div>}
          <h2 className="font-serif text-4xl leading-[1.02] tracking-tight text-ink transition-colors group-hover:text-accent md:text-5xl">
            {essay.title}
          </h2>
          {essay.excerpt && (
            <p className="mt-5 text-lg leading-relaxed text-ink-soft font-serif">
              {essay.excerpt}
            </p>
          )}
          <div className="mt-6 eyebrow">Read the essay →</div>
        </div>
      </Link>
    );
  }
  if (variant === "compact") {
    return (
      <Link to="/essays/$slug" params={{ slug: essay.slug }} className="group block rounded-[1.15rem] border border-rule/70 bg-card/70 p-4 transition-all hover:-translate-y-1 hover:border-ink/30 hover:bg-card">
        {essay.topic && <div className="eyebrow mb-2">{essay.topic.title}</div>}
        <h3 className="font-serif text-xl leading-snug text-ink transition-colors group-hover:text-accent">
          {essay.title}
        </h3>
        {essay.excerpt && (
          <p className="mt-2 text-sm leading-relaxed text-ink-soft line-clamp-2">{essay.excerpt}</p>
        )}
      </Link>
    );
  }
  return (
    <Link to="/essays/$slug" params={{ slug: essay.slug }} className="group block overflow-hidden rounded-[1.4rem] border border-rule/80 bg-card p-3 shadow-[0_20px_60px_-36px_rgba(0,0,0,0.28)] transition-transform hover:-translate-y-1">
      <div className="aspect-[4/5] overflow-hidden rounded-[1rem] bg-muted">
        {img ? (
          <img src={img} alt={essay.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />
        )}
      </div>
      <div className="p-4">
        {essay.topic && <div className="eyebrow mb-2">{essay.topic.title}</div>}
        <h3 className="font-serif text-2xl leading-tight text-ink transition-colors group-hover:text-accent">
          {essay.title}
        </h3>
        {essay.excerpt && (
          <p className="mt-2 text-sm leading-relaxed text-ink-soft line-clamp-3">{essay.excerpt}</p>
        )}
        <div className="mt-4 eyebrow">Open article →</div>
      </div>
    </Link>
  );
}
