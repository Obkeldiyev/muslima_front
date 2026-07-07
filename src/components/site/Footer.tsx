import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="rule-t mt-24 bg-background">
      <div className="mx-auto max-w-[1240px] px-6 md:px-10 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-serif text-2xl text-ink">Muslima</div>
          <p className="mt-3 max-w-md text-sm text-ink-soft leading-relaxed">
            A quiet publication for essays, books, and long-form reading. Published slowly, read
            slowly.
          </p>
        </div>
        <div>
          <div className="eyebrow mb-3">Read</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/essays" className="hover:text-ink text-ink-soft">Essays</Link></li>
            <li><Link to="/topics" className="hover:text-ink text-ink-soft">Topics</Link></li>
            <li><Link to="/books" className="hover:text-ink text-ink-soft">Books</Link></li>
          </ul>
        </div>
        <div>
          <div className="eyebrow mb-3">The House</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-ink text-ink-soft">About</Link></li>
            <li><Link to="/admin" className="hover:text-ink text-ink-soft">Studio</Link></li>
          </ul>
        </div>
      </div>
      <div className="rule-t">
        <div className="mx-auto max-w-[1240px] px-6 md:px-10 py-6 flex items-center justify-between text-xs text-ink-soft">
          <span>© {new Date().getFullYear()} Muslima. All rights reserved.</span>
          <span className="eyebrow">Printed on the web</span>
        </div>
      </div>
    </footer>
  );
}
