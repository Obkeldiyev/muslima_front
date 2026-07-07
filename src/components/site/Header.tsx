import { Link } from "@tanstack/react-router";

const nav = [
  { to: "/essays", label: "Essays" },
  { to: "/topics", label: "Topics" },
  { to: "/books", label: "Books" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  return (
    <header className="rule-b bg-background">
      <div className="mx-auto max-w-[1240px] px-6 md:px-10">
        <div className="flex items-center justify-between py-5">
          <Link to="/" className="flex items-baseline gap-3">
            <span className="font-serif text-2xl tracking-tight text-ink">Muslima</span>
            <span className="eyebrow hidden sm:inline">A Reading Room</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-sm text-ink-soft hover:text-ink transition-colors"
                activeProps={{ className: "text-sm text-ink" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="eyebrow hover:text-ink transition-colors"
            >
              Studio
            </Link>
          </div>
        </div>
        <div className="rule-t flex items-center justify-between py-2.5 text-[0.68rem] tracking-[0.14em] uppercase text-ink-soft">
          <span>Issue No. 01</span>
          <span className="hidden sm:inline">Essays · Topics · Books</span>
          <span>{new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
        </div>
      </div>
    </header>
  );
}
